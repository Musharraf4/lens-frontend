import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { FaTimes, FaTractor } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGoogleLeadFormConfig, useSaveGoogleLeadFormConfig } from "@/services/googleLeadFormConfig.api";

const FormSidebar = () => {
    const [isSpamFilterEnabled, setIsSpamFilterEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [stopWords, setStopWords] = useState<string[]>([]);
    const [newStopWord, setNewStopWord] = useState<string>("");

    const { mutate: saveGoogleLeadFormConfig } = useSaveGoogleLeadFormConfig();
    const { data: googleLeadFormConfig } = useGoogleLeadFormConfig();

    useEffect(() => {
        if (googleLeadFormConfig) {
            setIsSpamFilterEnabled(googleLeadFormConfig.spam_filter_enabled);
            setStopWords(googleLeadFormConfig.stop_words);
        }
    }, [googleLeadFormConfig]);

    const handleAddStopWord = (word: string) => {
        setNewStopWord("");
        if (word.trim() === "") return;
        if (stopWords.includes(word)) return;
        setStopWords([...stopWords, word]);
        saveGoogleLeadFormConfig({
            stop_words: [...stopWords, word],
        });
    };

    const handleRemoveStopWord = (word: string) => {
        setStopWords(stopWords.filter(w => w !== word));
        saveGoogleLeadFormConfig({
            stop_words: stopWords.filter(w => w !== word),
        });
    };

    const handleResetStopWords = () => {
        setStopWords([]);
        saveGoogleLeadFormConfig({
            stop_words: [],
        });
    };

    const handleToggleSpamFilter = () => {
        setIsSpamFilterEnabled(!isSpamFilterEnabled);
        saveGoogleLeadFormConfig({
            spam_filter_enabled: !isSpamFilterEnabled,
        });
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="w-1/4 bg-white rounded-3xl p-6">
            <div className="flex flex-col h-full justify-between">
                <div className="mb-8">
                    {isLoading ? (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <Skeleton className="h-6 w-24" />
                                <Skeleton className="h-5 w-10 rounded-full" />
                            </div>
                            <Skeleton className="h-10 w-full rounded-full" />
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-normal text-neutral-500 leading-6 tracking-[-0.02em] align-middle">Spam Filter</h3>
                                <Switch
                                    id="spam-filter"
                                    checked={isSpamFilterEnabled}
                                    onCheckedChange={handleToggleSpamFilter}
                                />
                            </div>
                            <div>
                                <Input
                                    type="text"
                                    placeholder="Type stop word"
                                    className="w-full px-4 py-3 text-sm text-gray-500 bg-gray-50 border border-gray-100 rounded-full focus:outline-none mb-2"
                                    disabled={!isSpamFilterEnabled}
                                    value={newStopWord}
                                    onChange={(e) => setNewStopWord(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && newStopWord.trim()) {
                                            handleAddStopWord(newStopWord);
                                        }
                                    }}
                                    icon={
                                        <div 
                                            className={`rounded-full text-xl cursor-pointer flex items-center justify-center h-6 w-6 bg-black text-white leading-none ${newStopWord.length === 0 ? 'opacity-0' : 'opacity-100'}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (newStopWord.trim()) {
                                                    handleAddStopWord(newStopWord);
                                                }
                                            }}
                                        >
                                            +
                                        </div>
                                    }
                                    iconPosition="right"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {stopWords?.map((word, index) => (
                                    <Badge key={index} className="rounded-full text-xs font-medium bg-[#F7F9FB] text-[#030C23] px-2 ">
                                        {word}
                                        <span className="text-xs cursor-pointer text-neutral-500 mx-1" onClick={() => handleRemoveStopWord(word)}>x</span>
                                    </Badge>
                                ))}
                                {stopWords?.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        className=" hover:text-foreground px-3 py-1 text-[16px] font-medium text-neutral-500 rounded-full"
                                        onClick={handleResetStopWords}
                                    >
                                        Reset
                                    </Button>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-auto">
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Image src="/FormFilledIcon.svg" alt="API Keys Icon" width={16} height={16} />
                            <span className="text-xs text-gray-500">
                                12 amount of forms submitted in the last 7 days
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FormSidebar;