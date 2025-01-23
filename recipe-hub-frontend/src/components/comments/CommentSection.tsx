// src/components/comments/CommentSection.tsx

import React, { useState } from 'react';
import { MessageSquare, Edit, Trash2 } from 'lucide-react';
import { Comment } from '../../types/types';
import { useAuth } from '../../context/AuthContext';
import { CommentService } from '../../services/api';

interface CommentSectionProps {
  recipeId: number;
  recipeComments: Comment[];
  onCommentUpdate: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  recipeId,
  recipeComments,
  onCommentUpdate,
}) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getCommentAuthorName = (author: any): string => {
    return typeof author === 'object' ? author.username : author;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await CommentService.create(recipeId, { content: newComment.trim() });
      setNewComment('');
      onCommentUpdate();
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (commentId: number) => {
    if (!editContent.trim()) return;

    setIsSubmitting(true);
    try {
      await CommentService.update(recipeId, commentId, { content: editContent.trim() });
      setEditingCommentId(null);
      onCommentUpdate();
    } catch (error) {
      console.error('Failed to edit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await CommentService.delete(recipeId, commentId);
      onCommentUpdate();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const canModifyComment = (comment: Comment): boolean => {
    if (!user) return false;
    const commentAuthorName = getCommentAuthorName(comment.author);
    return user.isAdmin || user.username === commentAuthorName;
  };

  const isCommentAuthor = (comment: Comment): boolean => {
    if (!user) return false;
    const commentAuthorName = getCommentAuthorName(comment.author);
    return user.username === commentAuthorName;
  };

  return (
    <div className="mt-8">
      <div className="flex items-center mb-6">
        <MessageSquare className="text-brown mr-2" />
        <h3 className="text-xl font-semibold text-brown">
          Comments ({recipeComments.length})
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full p-3 border border-tan rounded-lg focus:outline-none 
                   focus:ring-2 focus:ring-brown focus:border-brown resize-none"
          rows={3}
        />
        <button
          type="submit"
          disabled={isSubmitting || !newComment.trim()}
          className="mt-2 px-4 py-2 bg-brown text-white rounded-md hover:bg-opacity-90
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      <div className="space-y-6">
        {recipeComments.map((comment) => (
          <div key={comment.id} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-bold text-brown">
                  {getCommentAuthorName(comment.author)}
                </span>
                <span className="text-sm text-tan ml-2">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>

              {canModifyComment(comment) && (
                <div className="flex space-x-2">
                  {isCommentAuthor(comment) && (
                    <button
                      onClick={() => {
                        setEditingCommentId(comment.id);
                        setEditContent(comment.content);
                      }}
                      className="text-tan hover:text-brown transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-tan hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            {editingCommentId === comment.id ? (
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 border border-tan rounded-md focus:outline-none 
                           focus:ring-2 focus:ring-brown focus:border-brown resize-none"
                  rows={3}
                />
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => handleEdit(comment.id)}
                    disabled={isSubmitting}
                    className="px-3 py-1 bg-brown text-white rounded-md hover:bg-opacity-90
                             disabled:opacity-50 transition-colors text-sm"
                  >
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditingCommentId(null)}
                    className="px-3 py-1 border border-tan text-tan rounded-md 
                             hover:text-brown hover:border-brown transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700">{comment.content}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;