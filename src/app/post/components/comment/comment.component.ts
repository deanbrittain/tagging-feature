import { Component, Input } from '@angular/core';
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

  toggleCommentInput() {
    this.showCommentInput = !this.showCommentInput;
  }

  addComment() {
    if (this.newCommentText.trim() !== '') {
      const newComment: Comment = {
        userName: 'User Name', // Replace with actual user name if available
        text: this.newCommentText,
        timestamp: new Date(),
      };
      this.comments.push(newComment);
      this.newCommentText = ''; // Clear the input field
    }
  }
}
