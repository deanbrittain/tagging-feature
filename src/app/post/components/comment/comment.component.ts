import {
  Component,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild, // What is this doing? Why is it needed?
  Renderer2,
} from '@angular/core';

import { MatSnackBar } from '@angular/material/snack-bar';
import { CommentModel } from '../../models/comment.model';
import { HostListener } from '@angular/core';

interface User {
  userID: number;
  name: string;
}

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
})
export class CommentComponent {
  constructor(private snackBar: MatSnackBar, private renderer: Renderer2) {}

  @Output() commentIconClicked = new EventEmitter<void>();

  showCommentInput = false;
  newCommentText: string = '';
  comments: CommentModel[] = [];
  highlightedIndex = -1;
  lastSelectedUser = '';

  users: User[] = [
    { userID: 1, name: 'Kevin' },
    { userID: 2, name: 'Jeff' },
    { userID: 3, name: 'Bryan' },
    { userID: 4, name: 'Gabbey' },
  ];

  filteredUsers: User[] = [];

  @ViewChild('commentInput', { static: false }) commentInput!: ElementRef;

  toggleCommentInput() {
    this.showCommentInput = !this.showCommentInput;
    this.commentIconClicked.emit();
  }

  addComment() {
    const trimmedText = this.newCommentText.trim();
    if (trimmedText !== '') {
      this.createNewComment(trimmedText);
      this.notifyTaggedUsers(trimmedText);
      // Reset the comment input field
      this.commentInput.nativeElement.innerHTML = '';
    }
  }

  createNewComment(text: string) {
    const newComment: CommentModel = {
      userName: 'User Name',
      text: text,
      timestamp: new Date(),
    };
    this.comments.push(newComment);
  }

  notifyTaggedUsers(text: string) {
    const taggedUsers = this.extractTaggedUsers(text) as string[];
    const validUserNames = this.filterValidUsers(taggedUsers);

    // Map valid usernames to their corresponding user IDs
    const validUserIDs = validUserNames
      .map((name) => {
        const user = this.users.find((user) => user.name === name);
        return user ? user.userID : null;
      })
      .filter(Boolean); // Remove any null values

    // Remove duplicate user IDs
    const uniqueValidUserIDs = [...new Set(validUserIDs)];

    const uniqueValidUserNames = uniqueValidUserIDs
      .map((id) => {
        const user = this.users.find((user) => user.userID === id);
        return user ? user.name : null;
      })
      .filter(Boolean) as string[]; // Type assertion here

    if (uniqueValidUserNames.length > 0) {
      const toastMessage = this.generateToastMessage(uniqueValidUserNames);
      this.snackBar.open(toastMessage, 'Close', {
        duration: 3000,
      });
    }
  }

  extractTaggedUsers(text: string): string[] {
    return text.match(/@\w+/g) || [];
  }

  filterValidUsers(taggedUsers: string[]): string[] {
    const validUserNames = this.users.map((user) => user.name);
    return taggedUsers
      .filter((tag) => validUserNames.includes(tag.slice(1)))
      .map((user) => user.slice(1));
  }

  generateToastMessage(userNames: string[]): string {
    let message = '';
    if (userNames.length === 1) {
      message = `${userNames[0]} has been notified`;
    } else {
      const lastUser = userNames.pop();
      message = `${userNames.join(', ')} and ${lastUser} have been notified`;
    }
    return message;
  }

  onCommentInputChange(event: Event) {
    const content = this.commentInput.nativeElement.textContent;
    this.updateNewCommentText(content);
    this.styleTaggedNames(content);
    this.setCursorPosition();
    this.detectUserTagging(content);
    // You can now use the event object if needed
    console.log(event); // For demonstration; you might want to remove this in production
  }

  updateNewCommentText(content: string) {
    this.newCommentText = content;
  }

  styleTaggedNames(content: string) {
    const taggedNames = this.extractTaggedNames(content);
    const styledContent = this.applyStylesToTags(content, taggedNames);

    const cursorPos = this.captureCursorPosition();

    this.updateCommentInput(styledContent, taggedNames.length > 0);

    this.restoreCursorPosition(cursorPos);
  }

  extractTaggedNames(content: string): string[] {
    return content.match(/@\w+/g) || [];
  }

  applyStylesToTags(content: string, taggedNames: string[]): string {
    let styledContent = content;
    const validUsers = this.users.map((user) => user.name);

    taggedNames.forEach((tag) => {
      const tagName = tag.replace('@', '');
      if (validUsers.includes(tagName)) {
        styledContent = styledContent.replace(
          new RegExp(tag, 'g'),
          `<span class='tagged' style="color:red">${tag}</span>`
        );
      }
    });

    return styledContent;
  }

  captureCursorPosition(): number {
    const sel = window.getSelection();
    let cursorPos = 0;

    if (sel && sel.rangeCount) {
      const range = sel.getRangeAt(0);
      cursorPos = range.startOffset;
    }

    return cursorPos;
  }

  updateCommentInput(styledContent: string, hasTags: boolean) {
    if (hasTags) {
      this.commentInput.nativeElement.innerHTML = styledContent;
    }
  }

  restoreCursorPosition(cursorPos: number) {
    const sel = window.getSelection();

    if (sel) {
      const firstChild = this.commentInput.nativeElement.firstChild;

      if (firstChild && firstChild.nodeType === Node.TEXT_NODE) {
        let range = document.createRange();
        const maxCursorPos = firstChild.textContent
          ? firstChild.textContent.length
          : 0;
        range.setStart(firstChild, Math.min(cursorPos, maxCursorPos));
        range.collapse(true);

        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }

  setCursorPosition() {
    const range = document.createRange();
    const sel = window.getSelection();
    if (sel) {
      range.selectNodeContents(this.commentInput.nativeElement);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  detectUserTagging(content: string) {
    this.resetLastSelectedUserIfNecessary(content);

    if (this.isTaggingMode(content)) {
      this.filterUsersBasedOnTag(content);
    } else {
      this.filteredUsers = [];
    }
    this.highlightedIndex = -1;
  }

  resetLastSelectedUserIfNecessary(content: string) {
    const lastSelectedUserIndex = content.lastIndexOf(this.lastSelectedUser);
    const isUserAfterAtSymbol =
      content.indexOf(
        '@',
        lastSelectedUserIndex + this.lastSelectedUser.length
      ) !== -1;

    if (
      (lastSelectedUserIndex !== -1 && isUserAfterAtSymbol) ||
      !content.includes(this.lastSelectedUser)
    ) {
      this.lastSelectedUser = '';
    }
  }

  isTaggingMode(content: string): boolean {
    return content.includes('@') && !this.lastSelectedUser;
  }

  filterUsersBasedOnTag(content: string) {
    const atIndex = content.lastIndexOf('@');
    const afterAt = content.slice(atIndex + 1).split(' ')[0] || '';
    this.filteredUsers = this.users.filter((user) =>
      user.name.startsWith(afterAt)
    );
  }

  // Method to select a user from the filtered users list and update the comment input value.
  selectUser(user: any) {
    let content = this.getCommentInputText();
    const newContent = this.buildNewContent(content, user);

    this.updateCommentInputAndState(newContent);

    this.addSpaceAfterContent();

    this.resetUserDropdown();
  }

  // Extracts the text content from the comment input
  getCommentInputText(): string {
    return this.commentInput.nativeElement.textContent.trim();
  }

  // Builds the new comment content based on the selected user
  buildNewContent(content: string, user: any): string {
    const atIndex = content.lastIndexOf('@');
    const beforeAt = content.slice(0, atIndex);
    const afterAt = content.slice(atIndex).split(' ')[1] || '';

    return `${beforeAt}@${user.name}${afterAt}`.trim();
  }

  // Updates the inner HTML of the comment input and component state
  updateCommentInputAndState(newContent: string) {
    this.commentInput.nativeElement.innerHTML = newContent;
    this.newCommentText = newContent;
  }

  // Adds a space after the newly inserted username and updates the cursor position
  addSpaceAfterContent() {
    const textNode = this.renderer.createText(' '); // This is a space
    this.renderer.appendChild(this.commentInput.nativeElement, textNode);

    const range = document.createRange();
    const sel = window.getSelection();
    if (sel) {
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  // Resets the user dropdown and other related states
  resetUserDropdown() {
    this.filteredUsers = [];
    this.highlightedIndex = -1;
    this.lastSelectedUser = this.newCommentText;
    this.commentInput.nativeElement.focus();
  }

  @HostListener('keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.filteredUsers.length === 0) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        this.moveHighlightDown();
        break;
      case 'ArrowUp':
        this.moveHighlightUp();
        break;
      case 'Enter':
        this.selectHighlightedUser(event);
        break;
    }
  }

  // Move highlighted index down
  moveHighlightDown() {
    if (this.highlightedIndex < this.filteredUsers.length - 1) {
      this.highlightedIndex++;
    }
  }

  // Move highlighted index up
  moveHighlightUp() {
    if (this.highlightedIndex > 0) {
      this.highlightedIndex--;
    }
  }

  // Select the highlighted user
  selectHighlightedUser(event: KeyboardEvent) {
    if (this.highlightedIndex >= 0) {
      event.preventDefault();
      this.selectUser(this.filteredUsers[this.highlightedIndex]);
    }
  }
}
