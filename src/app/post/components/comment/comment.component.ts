// Import necessary Angular and Material modules
import {
  Component,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  Renderer2,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommentModel } from '../../models/comment.model';
import { HostListener } from '@angular/core';

// Define User interface
interface User {
  userID: number;
  name: string;
}

// Component metadata
@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
})
export class CommentComponent {
  // Constructor with injected dependencies
  constructor(private snackBar: MatSnackBar, private renderer: Renderer2) {}

  // Output event to communicate with parent component
  @Output() commentIconClicked = new EventEmitter<void>();

  // Component state
  showCommentInput = false;
  newCommentText: string = '';
  comments: CommentModel[] = [];
  highlightedIndex = -1;
  lastSelectedUser = ''; // Last selected username for tagging
  taggedUsers: { name: string; id: number }[] = []; // Users who are tagged

  // Mock data for users
  users: User[] = [
    { userID: 1, name: 'Kevin' },
    { userID: 2, name: 'Jeff' },
    { userID: 3, name: 'Jeff' },
    { userID: 4, name: 'Bryan' },
    { userID: 5, name: 'Gabbey' },
  ];

  // Filtered users based on input
  filteredUsers: User[] = [];

  // Reference to the comment input element in the template
  @ViewChild('commentInput', { static: false }) commentInput!: ElementRef;

  // Toggle comment input visibility
  toggleCommentInput() {
    this.showCommentInput = !this.showCommentInput;
    this.commentIconClicked.emit();
  }

  // Add a new comment
  addComment() {
    const trimmedText = this.newCommentText.trim();
    if (trimmedText !== '') {
      this.createNewComment(trimmedText);
      this.notifyTaggedUsers();
      this.commentInput.nativeElement.innerHTML = '';
    }
  }

  // Create a new comment object and add it to the comments array
  createNewComment(text: string) {
    const newComment: CommentModel = {
      userName: 'User Name',
      text: text,
      timestamp: new Date(),
    };
    this.comments.push(newComment);
  }

  // Notify tagged users with a snackbar
  notifyTaggedUsers() {
    // Extract unique user IDs
    const uniqueValidUserIDs = [
      ...new Set(this.taggedUsers.map((user) => user.id)),
    ];

    // Find usernames for these unique IDs
    const uniqueValidUserNames = uniqueValidUserIDs
      .map((id) => {
        const user = this.users.find((user) => user.userID === id);
        return user ? user.name : null;
      })
      .filter(Boolean) as string[];

    // Show notification if there are tagged users
    if (uniqueValidUserNames.length > 0) {
      const toastMessage = this.generateToastMessage(uniqueValidUserNames);
      this.snackBar.open(toastMessage, 'Close', {
        duration: 3000,
      });
    }

    // Clear tagged users for the next comment
    this.taggedUsers = [];
  }

  // Generate the message for the snackbar
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

  // Event handler for comment input changes
  onCommentInputChange() {
    // Extract content from the input
    const content = this.commentInput.nativeElement.textContent;
    // Update the comment text
    this.updateNewCommentText(content);
    // Style any tagged usernames
    this.styleTaggedNames(content);
    // Update cursor position
    this.setCursorPosition();
    // Check for user tagging
    this.detectUserTagging(content);
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

  selectUser(user: any) {
    let content = this.getCommentInputText();
    const newContent = this.buildNewContent(content, user);
    this.taggedUsers.push({ name: user.name, id: user.userID });

    this.updateCommentInputAndState(newContent);

    this.updateNewCommentText(newContent);
    this.styleTaggedNames(newContent);
    this.setCursorPosition();

    this.addSpaceAfterContent();

    this.resetUserDropdown();
  }

  getCommentInputText(): string {
    return this.commentInput.nativeElement.textContent.trim();
  }

  buildNewContent(content: string, user: any): string {
    const atIndex = content.lastIndexOf('@');
    const beforeAt = content.slice(0, atIndex);
    const afterAt = content.slice(atIndex).split(' ')[1] || '';

    return `${beforeAt}@${user.name}${afterAt}`.trim();
  }

  updateCommentInputAndState(newContent: string) {
    this.commentInput.nativeElement.innerHTML = newContent;
    this.newCommentText = newContent;
  }

  addSpaceAfterContent() {
    const textNode = this.renderer.createText(' ');
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
