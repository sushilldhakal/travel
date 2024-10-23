import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, ThumbsUp, Share2, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useQuery } from "@tanstack/react-query"
import { getCommentsByPost } from "@/http/api"
import { useParams } from "react-router-dom"
import { timeAgo } from "@/util/timeAgo"

interface Comment {
    id: number
    email: string
    approve: boolean
    postId: string
    author: string
    avatar: string
    content: string
    likes: number
    timestamp: string
    replies?: Comment[]
}

interface CommentComponentProps {
    comment: Comment
    depth?: number
    onRemove: (id: number) => void
    isAdmin?: boolean
}

const CommentComponent = ({ comment: initialComment, depth = 0, onRemove, isAdmin = false }: CommentComponentProps) => {
    const [comment, setComment] = useState(initialComment)
    const [isReplying, setIsReplying] = useState(false)
    const [replyContent, setReplyContent] = useState("")

    const handleLike = (event: React.MouseEvent) => {
        event.preventDefault()
        setComment(prevComment => ({
            ...prevComment,
            likes: prevComment.likes + 1
        }))
    }

    const handleReply = (event: React.MouseEvent) => {
        event.preventDefault()
        setIsReplying(!isReplying)
    }

    const handleShare = (event: React.MouseEvent) => {
        event.preventDefault()
        // Implement share functionality
        const shareText = `Check out this comment by ${comment.author}: "${comment.text}"`
        if (navigator.share) {
            navigator.share({
                title: 'Shared Comment',
                text: shareText,
                url: window.location.href,
            }).then(() => {
                toast({
                    title: "Shared successfully",
                    description: "The comment has been shared.",
                })
            }).catch((error) => {
                console.error('Error sharing:', error)
                toast({
                    title: "Share failed",
                    description: "There was an error sharing the comment.",
                    variant: "destructive",
                })
            })
        } else {
            // Fallback for browsers that don't support navigator.share
            navigator.clipboard.writeText(shareText).then(() => {
                toast({
                    title: "Copied to clipboard",
                    description: "The comment has been copied to your clipboard.",
                })
            }).catch((error) => {
                console.error('Error copying to clipboard:', error)
                toast({
                    title: "Copy failed",
                    description: "There was an error copying the comment to clipboard.",
                    variant: "destructive",
                })
            })
        }
    }

    const handleRemove = (event: React.MouseEvent) => {
        event.preventDefault()
        onRemove(comment.id)
    }

    const handleSubmitReply = (event: React.FormEvent) => {
        event.preventDefault()
        const newReply: Comment = {
            id: Date.now(),
            author: "Current User",
            approve: true,
            postId: "post123",
            email: "currentuser@example.com",
            avatar: "/placeholder.svg?height=40&width=40",
            content: replyContent,
            likes: 0,
            timestamp: "Just now"
        }
        setComment(prevComment => ({
            ...prevComment,
            replies: [...(prevComment.replies || []), newReply]
        }))
        setIsReplying(false)
        setReplyContent("")
    }

    return (
        <Card className={`mb-4 ${depth > 0 ? "ml-6" : ""}`}>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <Avatar>
                    <AvatarImage src="https://res.cloudinary.com/dmokg80lf/image/upload/v1726538695/main/tour-cover/fhuxaelnqttkmouqwvhg.jpg" alt="" />
                    <AvatarFallback>{comment.text}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-semibold">{comment?.user?.name}</h3>
                    <p className="text-sm text-muted-foreground">{timeAgo(new Date(comment?.created_at))}</p>
                </div>
            </CardHeader>
            <CardContent>
                <p>{comment.text}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
                <div className="flex gap-4">
                    <Button variant="ghost" size="sm" onClick={handleLike}>
                        <ThumbsUp className="mr-2 h-4 w-4" />
                        {comment.likes}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleReply}>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Reply
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleShare}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                    </Button>
                </div>
                {isAdmin && (
                    <Button variant="ghost" size="sm" onClick={handleRemove}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                    </Button>
                )}
            </CardFooter>
            {isReplying && (
                <CardFooter>
                    <form onSubmit={handleSubmitReply} className="flex w-full items-center space-x-2">
                        <Input
                            placeholder="Write a reply..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                        />
                        <Button onClick={handleSubmitReply}>Send</Button>
                    </form>
                </CardFooter>
            )}
            {comment.replies && comment.replies.map((reply) => (
                <CommentComponent
                    key={reply.id}
                    comment={reply}
                    depth={depth + 1}
                    onRemove={onRemove}
                    isAdmin={isAdmin}
                />
            ))}
        </Card>
    )
}

export default function Component() {
    const [comments, setComments] = useState<Comment[]>([
        {
            id: 1,
            email: "test@gmail.com",
            approve: true,
            postId: "66fb7fbeffb40ccdd1c72408",
            author: "Alice Johnson",
            avatar: "/placeholder.svg?height=40&width=40",
            content: "This is a great post! I learned a lot from it.",
            likes: 5,
            timestamp: "2 hours ago",
            replies: [
                {
                    id: 2,
                    email: "test@gmail.com",
                    approve: true,
                    postId: "66fb7fbeffb40ccdd1c72408",
                    author: "Bob Smith",
                    avatar: "/placeholder.svg?height=40&width=40",
                    content: "I agree! The examples were particularly helpful.",
                    likes: 2,
                    timestamp: "1 hour ago",
                    replies: [
                        {
                            id: 3,
                            email: "test@gmail.com",
                            approve: true,
                            postId: "66fb7fbeffb40ccdd1c72408",
                            author: "Charlie Davis",
                            avatar: "/placeholder.svg?height=40&width=40",
                            content: "I'd love to see more content like this.",
                            likes: 1,
                            timestamp: "30 minutes ago",
                        },
                    ],
                },
            ],
        },
        {
            id: 4,
            email: "test@gmail.com",
            approve: true,
            postId: "66fb7fbeffb40ccdd1c72408",
            author: "Diana Wilson",
            avatar: "/placeholder.svg?height=40&width=40",
            content: "Great insights! Looking forward to the next post.",
            likes: 3,
            timestamp: "3 hours ago",
        },
    ])

    const { postId } = useParams();

    const { data: commentByPost } = useQuery<Comment>({
        queryKey: ['comment', postId],
        queryFn: () => postId ? getCommentsByPost(postId) : Promise.reject('No tour ID provided'),
        enabled: !!postId,

    });


    console.log("commentByPost", commentByPost);

    const isAdmin = true // This would typically come from your authentication system

    const removeComment = (id: number) => {
        setComments(prevComments => {
            const removeRecursively = (comments: Comment[]): Comment[] => {
                return comments.filter(comment => {
                    if (comment.id === id) {
                        return false
                    }
                    if (comment.replies) {
                        comment.replies = removeRecursively(comment.replies)
                    }
                    return true
                })
            }
            return removeRecursively(prevComments)
        })
        toast({
            title: "Comment removed",
            description: "The comment has been successfully removed.",
        })
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">Comments</h2>
            {commentByPost?.map((comment) => (
                <CommentComponent
                    key={comment._id}
                    comment={comment}
                    onRemove={removeComment}
                    isAdmin={isAdmin}
                />
            ))}
        </div>
    )
}