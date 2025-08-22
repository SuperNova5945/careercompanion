import type { Express } from "express";
import { linkedinService } from "../services/linkedinService";

export function registerLinkedInAuthRoutes(app: Express) {
  // LinkedIn OAuth initiation
  app.get("/auth/linkedin", (req, res) => {
    const state = Math.random().toString(36).substring(7);
    const authUrl = linkedinService.getAuthorizationUrl(state);
    
    // Store state in session for security (in production, use proper session management)
    req.session = req.session || {};
    req.session.linkedinState = state;
    
    res.redirect(authUrl);
  });

  // LinkedIn OAuth callback
  app.get("/api/auth/linkedin/callback", async (req, res) => {
    try {
      const { code, state, error } = req.query;

      if (error) {
        return res.status(400).json({ 
          success: false, 
          error: `LinkedIn OAuth error: ${error}` 
        });
      }

      if (!code) {
        return res.status(400).json({ 
          success: false, 
          error: "Authorization code not provided" 
        });
      }

      // Verify state parameter (check against session)
      // Note: For development, we'll be more lenient with state validation
      const sessionState = req.session?.linkedinState;
      
      if (process.env.NODE_ENV === 'production' && state && sessionState && state !== sessionState) {
        console.error(`State mismatch: received ${state}, expected ${sessionState}`);
        return res.status(400).json({ 
          success: false, 
          error: "Invalid state parameter" 
        });
      }
      
      // Clear the state from session after use
      if (req.session?.linkedinState) {
        delete req.session.linkedinState;
      }

      // Exchange code for access token
      const tokens = await linkedinService.getAccessToken(code as string);
      
      // For popup OAuth flow, return HTML that closes the popup and passes token to parent
      const html = `
        <html>
          <body>
            <script>
              // Store token in localStorage for the parent window
              if (window.opener) {
                window.opener.localStorage.setItem('linkedin_access_token', '${tokens.access_token}');
                window.opener.postMessage({
                  type: 'LINKEDIN_AUTH_SUCCESS',
                  access_token: '${tokens.access_token}'
                }, '*');
              }
              window.close();
            </script>
            <p>Authentication successful! You can close this window.</p>
          </body>
        </html>
      `;
      
      res.send(html);

    } catch (error: any) {
      console.error("LinkedIn OAuth callback error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to complete LinkedIn authentication" 
      });
    }
  });

  // Get LinkedIn profile by access token
  app.post("/api/linkedin/profile", async (req, res) => {
    try {
      const { access_token } = req.body;

      if (!access_token) {
        return res.status(400).json({ 
          success: false, 
          error: "Access token is required" 
        });
      }

      const profile = await linkedinService.getProfile(access_token);
      
      res.json({
        success: true,
        profile
      });

    } catch (error: any) {
      console.error("LinkedIn profile fetch error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch LinkedIn profile" 
      });
    }
  });
}
