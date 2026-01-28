// Google Sheets service abstraction
// This service will be proxied via backend/Edge Functions to hide API keys
export class GoogleSheetsService {
    async getSheetData(spreadsheetId: string, range: string) {
        // Future implementation: call proxy endpoint
        console.log(`Fetching sheets data for ${spreadsheetId} from ${range}`);
        return [];
    }

    async updateSheet(spreadsheetId: string, range: string, values: any[][]) {
        // Future implementation: call proxy endpoint
        console.log(`Updating sheet ${spreadsheetId} at ${range}`);
    }
}

export const googleSheets = new GoogleSheetsService();
