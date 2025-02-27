import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {Auth0Provider} from "@auth0/auth0-react";

createRoot(document.getElementById('root')).render(
    <Auth0Provider
        domain="dev-6iygpn0kdurcf4mw.us.auth0.com"
        clientId="38CmHMufyD5xgKw20Ilj2e8VysCIMZzt"
        authorizationParams={{
            redirect_uri: window.location.origin,
            audience: "https://dev-6iygpn0kdurcf4mw.us.auth0.com/api/v2/", 
            scope: " openid profile email update:users read:users read:current_user_metadata",
        }}
    >
    <App />
    </Auth0Provider>
 ,
)
