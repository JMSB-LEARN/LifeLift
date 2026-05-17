import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GrantComment } from '../../api/models';

@Component({
  selector: 'app-grant-comments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './grant-comments.component.html',
  styleUrls: ['./grant-comments.component.css']
})
export class GrantCommentsComponent {
  @Input() comments: GrantComment[] = [];
  @Input() grantId!: number;
  @Input() isLoggedIn: boolean = false;

  @Output() postComment = new EventEmitter<{grantId: number, text: string}>();
  @Output() replyComment = new EventEmitter<{grantId: number, parentId: number, text: string}>();
  @Output() report = new EventEmitter<number>();

  newCommentText: string = '';
  replyTexts: { [commentId: number]: string } = {};
  replyingToId: number | null = null;

  toggleReply(commentId: number) {
    if (this.replyingToId === commentId) {
      this.replyingToId = null;
    } else {
      this.replyingToId = commentId;
      if (!this.replyTexts[commentId]) {
        this.replyTexts[commentId] = '';
      }
    }
  }

  onPostComment() {
    if (!this.newCommentText.trim()) return;
    this.postComment.emit({ grantId: this.grantId, text: this.newCommentText });
    this.newCommentText = '';
  }

  onPostReply(parentId: number) {
    const text = this.replyTexts[parentId];
    if (!text || !text.trim()) return;
    this.replyComment.emit({ grantId: this.grantId, parentId, text });
    this.replyTexts[parentId] = '';
    this.replyingToId = null;
  }

  onReport(commentId: number) {
    this.report.emit(commentId);
  }
}
