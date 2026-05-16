import React, { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { GoPencil } from "react-icons/go";
import Image from 'next/image';
import { IoCheckmark, IoCloseSharp } from 'react-icons/io5';
import { useAuth } from '@/store/AuthContext';

interface Note {
  id: number;
  author: string;
  created_at: string;
  body: string;
  updated_at: string | null;
  user_name?: string | null;
}


export default function Note({
  note,
  handleEdit,
  handleDelete
}: {
  note: Note,
  handleEdit: (note: Note) => void,
  handleDelete: (noteId: number) => void
}) {
  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [noteCopy, setNoteCopy] = useState(note);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function formatDateTime(input: string): string {
    const date = new Date(input);

    const formatter = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    return formatter.format(date);
  }

  useEffect(() => {
    setNoteCopy(note);
  }, [note]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.focus();

      // Move cursor to the end
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
    }
  }, [isEditing]);


  return (
    <div key={note?.id} className="relative mb-4">
      {/* Main Note Card */}
      <div
        className={`p-4 bg-neutral-25 border border-neutral-50 rounded-2xl flex transition duration-200 ${confirmDelete ? 'blur-sm pointer-events-none select-none' : ''
          }`}
      >
        <div className="flex items-center justify-between mb-1 w-full">
          <div className="flex-1 w-[70%]">
            <div className="flex items-center space-x-2">
              <Avatar className="w-6 h-6 mr-2">
                <AvatarImage src={user?.profile_picture ?? undefined} />
                <AvatarFallback>
                  {note?.user_name?.charAt(0).toUpperCase() || user?.first_name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs leading-4 font-semibold text-black">
                {note?.user_name || `${user?.first_name} ${user?.last_name}`}
              </span>
              <span className="text-xs color-[#030C23] text-black/60">
                {formatDateTime(note?.created_at)}
              </span>
              {note.updated_at && <span className="text-xs color-[#030C23] text-black/60">· edited</span>}
            </div>

            {isEditing ? (
              <textarea
                ref={textareaRef} // 3️⃣ Attach ref here
                value={noteCopy?.body}
                onChange={(e) => setNoteCopy({ ...noteCopy, body: e.target.value })}
                placeholder="Write your note..."
                className="w-full resize-none text-sm bg-transparent border-0 focus:ring-0 focus:outline-none placeholder-gray-400"
                rows={3}
              />
            ) : (
              <div className="text-base leading-6 font-normal text-black mt-1 break-words">{note?.body}</div>
            )}
          </div>

          <div className="h-full flex items-start justify-end space-x-2 pt-1 w-[30%]">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setNoteCopy(note);
                    setIsEditing(false);
                  }}
                  className="text-neutral-500 hover:text-neutral-600 cursor-pointer"
                >
                  <IoCloseSharp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    handleEdit(noteCopy);
                    setIsEditing(false);
                  }}
                  className="text-neutral-500 hover:text-neutral-600 cursor-pointer"
                >
                  <IoCheckmark className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-neutral-500 hover:text-neutral-600 cursor-pointer"
                  title="Edit"
                >
                  <GoPencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-neutral-500 hover:text-neutral-600 cursor-pointer"
                  title="Delete"
                >
                  <Image src="/TrashIcon.svg" alt="Delete" width={16} height={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {confirmDelete && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="w-full max-w-md mx-auto text-center">
            <p className="font-semibold text-lg text-black mb-1">Are you sure you want to delete the note?</p>
            <p className="text-sm text-gray-500 mb-4">The note couldn’t be restored.</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  handleDelete(note.id);
                  setConfirmDelete(false);
                }}
                className="bg-white text-black border text-sm font-medium px-4 py-2 rounded-full"
              >
                Yes, delete note
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="bg-[#111827] text-white text-sm font-medium px-4 py-2 rounded-full"
              >
                No, keep note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
