export interface TwitterResult{
    statuses: [DownloadedTweet]
}

export interface DownloadedTweet {
    created_at: string,
    id:number,
    text:string
}

export interface TweetObjectToSave{
    TableName?:string,
    Item?: {
        id: number,
        creationDate: string,
        keyword: string,
        tweet: string
    }
}