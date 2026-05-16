import React, { useEffect, useState } from "react";
import { GoPlusCircle } from "react-icons/go";
import Note from "./Note";
import { IoCheckmark, IoCloseSharp } from "react-icons/io5";
import { useAuth } from "@/store/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
    useCreateNote,
    useDeleteNote,
    useNotesByContactId,
    useUpdateNote,
} from "@/services/contacts.api";
import { Skeleton } from "../ui/skeleton";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";

type NoteType = {
    id: number;
    author: string;
    created_at: string;
    body: string;
    updated_at: string | null;
    user_name?: string | null;
};


function NotesTab({ contactId }: { contactId: string }) {
    const { user } = useAuth();
    const { selectedCompany } = useSelectedCompanyStore();

    const { data: notesData, isLoading: isLoadingNotes } =
        useNotesByContactId(contactId, selectedCompany?.company?.id || '');
    const createNoteMutation = useCreateNote();
    const [notes, setNotes] = useState<NoteType[] | []>(
        notesData ? notesData : []
    );
    const [isAddNote, setIsAddNote] = useState(false);
    const [text, setText] = useState("");
    const updateNoteMutation = useUpdateNote();
    const deleteNoteMutation = useDeleteNote();
    const handleAdd = () => {
        setIsAddNote(true);
        setText("");
    };
    const handleEdit = (note: NoteType) => {
        if (note.body.trim() === "") return;
        setNotes(notes.map((n) => (n.id === note.id ? note : n)));
        updateNoteMutation.mutate({
            contactId,
            company_id: selectedCompany?.company?.id ?? '',
            noteId: note.id.toString(),
            data: note.body,
        });
    };
    const handleSave = () => {
        if (text.trim() === "") return;
        // setNotes([newNote, ...notes]);

        setIsAddNote(false);
        setText("");
        createNoteMutation.mutate({
            contactId,
            company_id: selectedCompany?.company?.id ?? '',
            data: text,
        });
    };

    const handleCancel = () => {
        setIsAddNote(false);
        setText("");
    };

    const handleDelete = (noteId: number) => {
        setNotes(notes.filter((note) => note.id !== noteId));
        deleteNoteMutation.mutate({ contactId, company_id: selectedCompany?.company?.id ?? '', noteId: noteId.toString() });
    };

    useEffect(() => {
        if (notesData) {
            setNotes(notesData);
        }
    }, [notesData, isLoadingNotes])

    if (isLoadingNotes) {
        return <Skeleton className="h-32 w-full rounded-xl" />;
    }
    return (
        <div>
            {/* Add button */}
            <button
                onClick={handleAdd}
                disabled={isAddNote}
                className={`text-black bg-white hover:bg-neutral-25 mb-4 px-4 py-2 border border-neutral-200 rounded-3xl text-sm flex items-center gap-2 font-medium
                    ${isAddNote ? "opacity-50 cursor-not-allowed" : ""}
                `}
            >
                <GoPlusCircle className="w-4 h-4" />
                Add note
            </button>

            {/* Add/Edit box like screenshot */}
            {isAddNote && (
                <div className="bg-neutral-25 rounded-xl p-4 mb-4 shadow-sm relative">
                    {/* Header: Avatar + Author + Icons */}
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage
                                    src={user?.profile_picture ?? undefined}
                                    alt="User Avatar"
                                />
                                <AvatarFallback className="bg-gray-200 text-gray-600">
                                    {user?.first_name?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-gray-900">
                                {user?.first_name} {user?.last_name}
                            </span>
                        </div>
                        <div className="h-full flex items-start justify-end space-x-2 pt-1 w-[30%]">
                            <button
                                onClick={handleCancel}
                                className="text-neutral-500 hover:text-neutral-600 cursor-pointer"
                            >
                                <IoCloseSharp className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleSave}
                                className="text-neutral-500 hover:text-neutral-600 cursor-pointer"
                            >
                                <IoCheckmark className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Textarea */}
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Write your note..."
                        className="w-full resize-none text-sm bg-transparent border-0 focus:ring-0 focus:outline-none placeholder-gray-400"
                        rows={3}
                    />
                </div>
            )}

            {/* Notes list */}
            {notes?.length > 0 ? notes.map((note) => (
                <div key={note.id} className="mb-3">
                    <Note
                        note={note}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                    />
                </div>
            )) : (
                <p className="text-center">No notes yet</p>
            )}
        </div>
    );
}

export default NotesTab;
