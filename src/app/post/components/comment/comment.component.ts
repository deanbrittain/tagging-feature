import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  HostListener,
} from '@angular/core';
import { CommentModel } from '../../models/comment.model';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CommentComponent {
  @Input() comment!: CommentModel;
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
  @Output() commentIconClicked = new EventEmitter<void>();

  toggleCommentInput() {
    this.showCommentInput = !this.showCommentInput;
    this.commentIconClicked.emit();
  }

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

  onCommentInputChange(event: any) {
    this.commentInputValue = this.commentInput.nativeElement.innerText;
    this.newCommentText = this.commentInputValue;

    let isTagging = false;

    if (this.commentInputValue.includes('@')) {
      const words = this.commentInputValue.split(' ');
      const lastWord = words[words.length - 1];

      if (lastWord.startsWith('@')) {
        isTagging = true;
        const afterAt = lastWord.slice(1);
        const lowerCaseAfterAt = afterAt.toLowerCase();

        this.filteredUsers = this.users.filter((user) =>
          user.name.toLowerCase().includes(lowerCaseAfterAt)
        );
      }
    }

    if (!isTagging) {
      this.filteredUsers = [];
    }

    this.highlightedIndex = -1;
  }

  selectUser(user: any) {
    const atIndex = this.commentInput.nativeElement.innerHTML.lastIndexOf('@');
    const beforeAt = this.commentInput.nativeElement.innerHTML.slice(
      0,
      atIndex
    );
    const afterAt =
      this.commentInput.nativeElement.innerHTML
        .slice(atIndex + 1)
        .split(' ')[1] || '';

    const wrappedName = user.name
      .split('')
      .map(
        (char: string, index: number) =>
          `<span style="animation-delay: ${index * 0.1}s">${char}</span>`
      )
      .join('');

    // Create a new span element for the tagged name
    const newTag = document.createElement('span');
    newTag.className = 'tagged-name new-tag animate';

    // Create a new span element for the highlighted tag
    const highlightedTag = document.createElement('span');
    highlightedTag.className = 'highlighted-tag';
    highlightedTag.innerHTML = '@' + wrappedName;

    // Append the highlighted tag to the new tag
    newTag.appendChild(highlightedTag);

    // Update the innerHTML and append the new tag
    this.commentInput.nativeElement.innerHTML = `${beforeAt} ${afterAt}`;
    this.commentInput.nativeElement.appendChild(newTag);

    // Remove the 'new-tag' and 'animate' classes from all tags
    this.commentInput.nativeElement
      .querySelectorAll('.tagged-name')
      .forEach((tag: HTMLElement) => {
        tag.classList.remove('new-tag');
        tag.classList.remove('animate');
      });

    // Add the 'new-tag' and 'animate' classes only to the newly added tag
    newTag.classList.add('new-tag');
    newTag.classList.add('animate');

    // Update the commentInputValue and newCommentText
    this.commentInputValue = this.commentInput.nativeElement.innerText;
    this.newCommentText = this.commentInputValue;

    // Hide the dropdown and reset the highlighted index
    this.filteredUsers = [];
    this.highlightedIndex = -1;
    this.lastSelectedUser = `@${user.name}`; // Keep the "@" symbol here

    // Set the cursor at the end
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(this.commentInput.nativeElement);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
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
