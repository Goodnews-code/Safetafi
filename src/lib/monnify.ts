/**
 * Monnify Helper Library
 * Handles authentication and transaction verification.
 */

const MONNIFY_BASE_URL = process.env.NEXT_PUBLIC_MONNIFY_API_KEY?.startsWith("MK_PROD")
    ? "https://api.monnify.com"
    : "https://sandbox.monnify.com";

export interface MonnifyAuthResponse {
    requestSuccessful: boolean;
    responseMessage: string;
    responseBody: {
        accessToken: string;
        expiresIn: number;
    };
}

export interface MonnifyTransactionResponse {
    requestSuccessful: boolean;
    responseMessage: string;
    responseBody: {
        transactionReference: string;
        paymentReference: string;
        amount: number;
        payableAmount: number;
        amountPaid: number;
        paymentStatus: string;
        paymentDescription: string;
        customerName: string;
        customerEmail: string;
        paymentDate: string;
        metaData?: any;
    };
}

/**
 * Get an access token from Monnify
 */
export async function getMonnifyAccessToken(): Promise<string | null> {
    const apiKey = process.env.NEXT_PUBLIC_MONNIFY_API_KEY;
    const secretKey = process.env.MONNIFY_SECRET_KEY;

    if (!apiKey || !secretKey) {
        console.error("Monnify API Key or Secret Key missing");
        return null;
    }

    try {
        const auth = Buffer.from(`${apiKey}:${secretKey}`).toString("base64");
        const response = await fetch(`${MONNIFY_BASE_URL}/api/v1/auth/login`, {
            method: "POST",
            headers: {
                Authorization: `Basic ${auth}`,
            },
        });

        const data: MonnifyAuthResponse = await response.json();

        if (data.requestSuccessful) {
            return data.responseBody.accessToken;
        } else {
            console.error("Monnify login failed:", data.responseMessage);
            return null;
        }
    } catch (error) {
        console.error("Monnify login error:", error);
        return null;
    }
}

/**
 * Verify a transaction with Monnify
 */
export async function verifyMonnifyTransaction(transactionReference: string): Promise<MonnifyTransactionResponse | null> {
    const accessToken = await getMonnifyAccessToken();

    if (!accessToken) return null;

    try {
        const response = await fetch(
            `${MONNIFY_BASE_URL}/api/v2/transactions/${transactionReference}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        const data: MonnifyTransactionResponse = await response.json();
        return data.requestSuccessful ? data : null;
    } catch (error) {
        console.error("Monnify verification error:", error);
        return null;
    }
}
