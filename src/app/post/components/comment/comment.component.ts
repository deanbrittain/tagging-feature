import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Comment } from '../../models/comment.model';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
})
export class CommentComponent {
  @Input() comment!: Comment;
  showCommentInput = false;
  newCommentText = '';
  comments: Comment[] = [];
  users = [
    { userID: 1, name: 'Kevin' },
    { userID: 2, name: 'Jeff' },
    { userID: 3, name: 'Bryan' },
    { userID: 4, name: 'Gabbey' },
  ];
  filteredUsers: any[] = [];

  @Output() commentIconClicked = new EventEmitter<void>();

  toggleCommentInput() {
    this.showCommentInput = !this.showCommentInput;
    this.commentIconClicked.emit(); // Emit the event when the comment icon is clicked
  }

  addComment() {
    if (this.newCommentText.trim() !== '') {
      const newComment: Comment = {
        userName: 'User Name',
        text: this.newCommentText,
        timestamp: new Date(),
      };
      this.comments.push(newComment);
      this.newCommentText = '';
    }
  }
  // Variable to hold the current input value
  commentInputValue: string = '';

  // Method to detect '@' symbol
  onCommentInputChange(event: any) {
    this.commentInputValue = event.target.value;
    this.newCommentText = this.commentInputValue; // Update the new comment text

    if (this.commentInputValue.includes('@')) {
      // Logic to handle '@' symbol detection
      console.log('Detected @ symbol');
    }
  }

  selectUser(user: any) {
    const atIndex = this.commentInputValue.lastIndexOf('@');
    const beforeAt = this.commentInputValue.slice(0, atIndex);
    const afterAt = this.commentInputValue.slice(atIndex).split(' ')[1] || '';

    this.commentInputValue = `${beforeAt}@${user.name} ${afterAt}`;
    this.newCommentText = this.commentInputValue; // Update the new comment text
    this.filteredUsers = []; // Clear the filtered users
  }
}
