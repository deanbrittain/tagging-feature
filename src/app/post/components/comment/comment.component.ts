import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  Renderer2,
  HostListener,
} from '@angular/core';

import { MatSnackBar } from '@angular/material/snack-bar';
import { CommentModel } from '../../models/comment.model';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
})
export class CommentComponent {
  constructor(private snackBar: MatSnackBar, private renderer: Renderer2) {}

  @Input() comment!: CommentModel;
  @Output() commentIconClicked = new EventEmitter<void>();

  showCommentInput = false;
  newCommentText = '';
  commentInputValue: string = '';
  comments: CommentModel[] = [];
  highlightedIndex: number = -1;
  lastSelectedUser: string = '';

  users = [
    { userID: 1, name: 'Kevin' },
    { userID: 2, name: 'Jeff' },
    { userID: 3, name: 'Bryan' },
    { userID: 4, name: 'Gabbey' },
  ];

  filteredUsers: any[] = [];

  @ViewChild('commentInput', { static: false }) commentInput!: ElementRef;

  toggleCommentInput() {
    this.showCommentInput = !this.showCommentInput;
    this.commentIconClicked.emit();
  }

  // Method to add a new comment to the comments array.
  addComment() {
    if (this.newCommentText.trim() !== '') {
      const newComment: CommentModel = {
        userName: 'User Name',
        text: this.newCommentText.trim(),
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

  onCommentInputChange(event: any) {
    // Get the text content from the contenteditable element
    let content = this.commentInput.nativeElement.textContent;

    // Update the component's state variables with the new content
    this.commentInputValue = content;
    this.newCommentText = content; //*** WHY ARE WE CAPTURING THIS TWICE? */

    // Use regex to find all instances of tagged names (e.g., @John)
    const taggedNames = content.match(/@\w+/g) || [];

    // Initialize a variable to hold the styled content
    let styledContent = content;

    // Loop through each tagged name and replace it with a styled version *** THIS ISN'T WORKING, TEST THIS ***
    taggedNames.forEach((tag: string) => {
      styledContent = styledContent.replace(
        new RegExp(tag, 'g'),
        `<span class='tagged' style="color:red">${tag}</span>`
      );
    });

    // Update the innerHTML only if there are tagged names
    if (taggedNames.length > 0) {
      this.commentInput.nativeElement.innerHTML = styledContent; // WHAT IS THIS LINE DOING EXACTLY?
    }

    // Create a new range object to manipulate the cursor position
    const range = document.createRange();

    // Get the current selection object
    const sel = window.getSelection();

    // Check if a selection object exists
    if (sel) {
      // Set the cursor position to the end of the content
      range.selectNodeContents(this.commentInput.nativeElement);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    // Check if the last selected user is still in the content
    const lastSelectedUserIndex = content.lastIndexOf(this.lastSelectedUser);
    if (
      lastSelectedUserIndex !== -1 &&
      content.indexOf(
        '@',
        lastSelectedUserIndex + this.lastSelectedUser.length
      ) !== -1
    ) {
      // Reset the last selected user if a new '@' is typed
      this.lastSelectedUser = '';
    } else if (!content.includes(this.lastSelectedUser)) {
      // Reset the last selected user if it's no longer in the content
      this.lastSelectedUser = '';
    }

    // Detect if a new '@' symbol is typed
    if (content.includes('@') && !this.lastSelectedUser) {
      console.log('Detected @ symbol');
      const atIndex = content.lastIndexOf('@');
      const afterAt = content.slice(atIndex + 1).split(' ')[0] || '';

      // Filter the list of users based on the text after the '@'
      this.filteredUsers = this.users.filter((user) =>
        user.name.startsWith(afterAt)
      );
    } else {
      // Reset the filtered users list if no '@' is detected
      this.filteredUsers = [];
    }

    // Reset the highlighted index for the dropdown
    this.highlightedIndex = -1;
  }

  // Method to select a user from the filtered users list and update the comment input value.
  selectUser(user: any) {
    let content = this.commentInput.nativeElement.textContent; // Use textContent
    content = content.trim(); // Explicitly trim the text
    const atIndex = content.lastIndexOf('@');
    const beforeAt = content.slice(0, atIndex);
    const afterAt = content.slice(atIndex).split(' ')[1] || '';

    const newContent = `${beforeAt}<span class='tagged' style="color: red">@${user.name}</span>&nbsp;${afterAt}`;
    this.commentInput.nativeElement.innerHTML = newContent.trim(); // Trim here too
    this.newCommentText = newContent.trim(); // Trim here too

    const textNode = this.renderer.createText(' '); // This is a space
    this.renderer.appendChild(this.commentInput.nativeElement, textNode);

    // Update the cursor position to be after the new text node
    const range = document.createRange();
    const sel = window.getSelection();
    if (sel) {
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      sel.removeAllRanges();
      sel.addRange(range);
    }

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
