export interface DownloadedCryptoObject {
    Response: string,
    Message?: string,
    HasWarning: boolean,
    Data: [{
            time: number,
            close: number
        }]
}


export interface CryptoObjectToSave{
    TableName?:string,
    Item?: {
        TimeTransaction: number,
        CurrencyName: string,
        Price: number
    }
}