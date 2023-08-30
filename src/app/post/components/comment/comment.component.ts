import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
} from '@angular/core';

import { MatSnackBar } from '@angular/material/snack-bar';
import { CommentModel } from '../../models/comment.model';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
})
export class CommentComponent {
  constructor(private snackBar: MatSnackBar) {}
  // Input property to receive the comment data from the parent component.
  @Input() comment!: CommentModel;

  // State variable to control the visibility of the comment input field.
  showCommentInput = false;

  // State variable to hold the text of the new comment being added.
  newCommentText = '';

  // State variable to hold the value of the comment input field.
  commentInputValue: string = '';

  // Array to hold the list of comments.
  comments: CommentModel[] = [];

  highlightedIndex: number = -1;

  lastSelectedUser: string = '';

  // Predefined list of users for the tagging feature.
  users = [
    { userID: 1, name: 'Kevin' },
    { userID: 2, name: 'Jeff' },
    { userID: 3, name: 'Bryan' },
    { userID: 4, name: 'Gabbey' },
  ];

  // Array to hold the filtered users based on the input after the "@" symbol.
  filteredUsers: any[] = [];

  @ViewChild('commentInput', { static: false }) commentInput!: ElementRef;

  // Output event to notify the parent component when the comment icon is clicked.
  @Output() commentIconClicked = new EventEmitter<void>();

  // Method to toggle the visibility of the comment input field.
  toggleCommentInput() {
    this.showCommentInput = !this.showCommentInput;
    this.commentIconClicked.emit();
  }

  // Method to add a new comment to the comments array.
  addComment() {
    if (this.newCommentText.trim() !== '') {
      const newComment: CommentModel = {
        userName: 'User Name',
        text: this.newCommentText,
        timestamp: new Date(),
      };
      this.comments.push(newComment);
      this.commentInputValue = '';

      // Extract tagged usernames
      const taggedUsers = this.newCommentText.match(/@\w+/g);
      if (taggedUsers) {
        const userNames = taggedUsers.map((user) => user.slice(1)); // Remove '@'
        let toastMessage = '';
        if (userNames.length === 1) {
          toastMessage = `${userNames[0]} has been notified`;
        } else {
          const lastUser = userNames.pop();
          toastMessage = `${userNames.join(
            ', '
          )} and ${lastUser} have been notified`;
        }
        // Display the toast (replace this with your actual toast logic)
        this.snackBar.open(toastMessage, 'Close', {
          duration: 3000,
        });
      }
    }
  }

  // Method to handle changes in the comment input field.
  // It detects the "@" symbol and filters the users accordingly.
  onCommentInputChange(event: any) {
    this.commentInputValue = event.target.value;
    this.newCommentText = this.commentInputValue;

    // Reset lastSelectedUser if a new @ symbol is typed after the last selected user's name
    const lastSelectedUserIndex = this.commentInputValue.lastIndexOf(
      this.lastSelectedUser
    );
    if (
      lastSelectedUserIndex !== -1 &&
      this.commentInputValue.indexOf(
        '@',
        lastSelectedUserIndex + this.lastSelectedUser.length
      ) !== -1
    ) {
      this.lastSelectedUser = '';
    } else if (!this.commentInputValue.includes(this.lastSelectedUser)) {
      this.lastSelectedUser = '';
    }

    if (!this.commentInputValue.includes(this.lastSelectedUser)) {
      this.lastSelectedUser = '';
    }

    if (this.commentInputValue.includes('@') && !this.lastSelectedUser) {
      console.log('Detected @ symbol');
      const atIndex = this.commentInputValue.lastIndexOf('@');
      const afterAt =
        this.commentInputValue.slice(atIndex + 1).split(' ')[0] || '';
      this.filteredUsers = this.users.filter((user) =>
        user.name.startsWith(afterAt)
      );
    } else {
      this.filteredUsers = [];
    }
    this.highlightedIndex = -1;
  }

  // Method to select a user from the filtered users list and update the comment input value.
  selectUser(user: any) {
    const atIndex = this.commentInputValue.lastIndexOf('@');
    const beforeAt = this.commentInputValue.slice(0, atIndex);
    const afterAt = this.commentInputValue.slice(atIndex).split(' ')[1] || '';

    this.commentInputValue = `${beforeAt}@${user.name} ${afterAt}`;
    this.newCommentText = this.commentInputValue;

    // This should hide the dropdown
    this.filteredUsers = [];
    this.highlightedIndex = -1;
    this.lastSelectedUser = `@${user.name}`;
    this.commentInput.nativeElement.focus();
  }

  @HostListener('keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.filteredUsers.length > 0) {
      if (event.key === 'ArrowDown') {
        if (this.highlightedIndex < this.filteredUsers.length - 1) {
          this.highlightedIndex++;
        }
      }
      if (event.key === 'ArrowUp') {
        if (this.highlightedIndex > 0) {
          this.highlightedIndex--;
        }
      }
      if (event.key === 'Enter') {
        if (this.highlightedIndex >= 0) {
          event.preventDefault();
          this.selectUser(this.filteredUsers[this.highlightedIndex]);
        }
      }
    }
  }
}
