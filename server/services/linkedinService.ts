import axios from 'axios';

export interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  headline?: string;
  summary?: string;
  location?: {
    country: string;
    region: string;
  };
  industry?: string;
  profilePicture?: string;
  publicProfileUrl?: string;
  positions?: Array<{
    title: string;
    companyName: string;
    description?: string;
    startDate?: {
      month: number;
      year: number;
    };
    endDate?: {
      month: number;
      year: number;
    };
    isCurrent: boolean;
  }>;
  educations?: Array<{
    schoolName: string;
    fieldOfStudy?: string;
    degree?: string;
    startDate?: {
      year: number;
    };
    endDate?: {
      year: number;
    };
  }>;
  skills?: Array<{
    name: string;
  }>;
  email?: string;
}

export interface LinkedInAuthTokens {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export class LinkedInService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private baseUrl = 'https://api.linkedin.com/v2';

  constructor() {
    this.clientId = process.env.LINKEDIN_CLIENT_ID || '';
    this.clientSecret = process.env.LINKEDIN_CLIENT_SECRET || '';
    this.redirectUri = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:5000/auth/linkedin/callback';

    console.log('LinkedIn Service initialized with:');
    console.log('- Client ID:', this.clientId ? `${this.clientId.substring(0, 8)}...` : 'NOT SET');
    console.log('- Client Secret:', this.clientSecret ? 'SET' : 'NOT SET');
    console.log('- Redirect URI:', this.redirectUri);

    if (!this.clientId || !this.clientSecret) {
      console.warn('LinkedIn API credentials not configured. Profile retrieval will use fallback data.');
    }
  }

  /**
   * Generate LinkedIn OAuth authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    const scopes = [
      'profile',
      'w_member_social'
    ].join(' ');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: scopes,
      ...(state && { state })
    });

    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(code: string): Promise<LinkedInAuthTokens> {
    try {
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri
      });

      const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('LinkedIn token exchange error:', error.response?.data || error.message);
      throw new Error('Failed to exchange authorization code for access token');
    }
  }

  /**
   * Get LinkedIn profile using access token
   */
  async getProfile(accessToken: string): Promise<LinkedInProfile> {
    try {
      // Get basic profile information using LinkedIn API v2
      const profileResponse = await axios.get(`${this.baseUrl}/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'cache-control': 'no-cache',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });

      const profile = profileResponse.data;
      
      // Try to get email if available (may require additional permissions)
      let email = null;
      try {
        const emailResponse = await axios.get(`${this.baseUrl}/emailAddress?q=members&projection=(elements*(handle~))`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'cache-control': 'no-cache'
          }
        });
        email = emailResponse.data.elements?.[0]?.['handle~']?.emailAddress;
      } catch (emailError) {
        console.warn('Could not fetch email address - may require additional permissions');
      }

      return {
        id: profile.id,
        firstName: profile.localizedFirstName || '',
        lastName: profile.localizedLastName || '',
        headline: profile.localizedHeadline || '',
        summary: undefined, // Not available with basic profile scope
        location: undefined, // Not available with basic profile scope
        industry: undefined, // Not available with basic profile scope
        profilePicture: profile.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier,
        publicProfileUrl: undefined, // Not directly available in v2 /me endpoint
        positions: [], // Will be empty with basic scopes
        educations: [], // Will be empty with basic scopes
        skills: [], // Will be empty with basic scopes
        email
      };
    } catch (error: any) {
      console.error('LinkedIn profile fetch error:', error.response?.data || error.message);
      throw new Error('Failed to fetch LinkedIn profile');
    }
  }

  /**
   * Extract LinkedIn profile ID from public profile URL
   */
  extractProfileIdFromUrl(linkedinUrl: string): string | null {
    const patterns = [
      /linkedin\.com\/in\/([^\/\?]+)/,
      /linkedin\.com\/pub\/[^\/]+\/[^\/]+\/[^\/]+\/([^\/\?]+)/
    ];

    for (const pattern of patterns) {
      const match = linkedinUrl.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Scrape basic LinkedIn profile data from public profile URL
   * This is a fallback method when OAuth access token is not available
   */
  async scrapePublicProfile(linkedinUrl: string): Promise<Partial<LinkedInProfile> | null> {
    try {
      // Extract profile ID from URL
      const profileId = this.extractProfileIdFromUrl(linkedinUrl);
      if (!profileId) {
        console.warn('Could not extract profile ID from LinkedIn URL:', linkedinUrl);
        return null;
      }

      // For now, return a mock profile structure that can be enhanced
      // In a production environment, you would implement web scraping or use LinkedIn's public API
      console.log('Extracting profile data from LinkedIn URL:', linkedinUrl);
      
      return {
        id: profileId,
        firstName: 'LinkedIn',
        lastName: 'User',
        headline: 'Professional extracted from LinkedIn profile',
        publicProfileUrl: linkedinUrl,
        // Additional fields would be populated through scraping or API calls
      };
    } catch (error: any) {
      console.error('Error scraping LinkedIn profile:', error);
      return null;
    }
  }

  /**
   * Check if LinkedIn API is configured
   */
  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }
}

export const linkedinService = new LinkedInService();
