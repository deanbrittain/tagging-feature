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
}
