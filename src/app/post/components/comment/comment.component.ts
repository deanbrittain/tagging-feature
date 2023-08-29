import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommentModel } from '../../models/comment.model';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
})
export class CommentComponent {
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

  // Predefined list of users for the tagging feature.
  users = [
    { userID: 1, name: 'Kevin' },
    { userID: 2, name: 'Jeff' },
    { userID: 3, name: 'Bryan' },
    { userID: 4, name: 'Gabbey' },
  ];

  // Array to hold the filtered users based on the input after the "@" symbol.
  filteredUsers: any[] = [];

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
    }
  }

  // Method to handle changes in the comment input field.
  // It detects the "@" symbol and filters the users accordingly.
  onCommentInputChange(event: any) {
    this.commentInputValue = event.target.value;
    this.newCommentText = this.commentInputValue;

    if (this.commentInputValue.includes('@')) {
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
  }

  // Method to select a user from the filtered users list and update the comment input value.
  selectUser(user: any) {
    const atIndex = this.commentInputValue.lastIndexOf('@');
    const beforeAt = this.commentInputValue.slice(0, atIndex);
    const afterAt = this.commentInputValue.slice(atIndex).split(' ')[1] || '';

    this.commentInputValue = `${beforeAt}@${user.name} ${afterAt}`;
    this.newCommentText = this.commentInputValue;
    this.filteredUsers = [];
  }
}
