import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {Auth0Provider} from "@auth0/auth0-react";

import { AuthProvider } from "react-oidc-context";

const cognitoAuthConfig = {
    authority: "https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_i8rut828H",
    client_id: "71jdc4b1eh18i8d6f4194f7b1p",
    redirect_uri: "https://localhost:5173/redirect",
    response_type: "code",
    scope: "email openid phone",
};

createRoot(document.getElementById('root')).render(
    <AuthProvider {...cognitoAuthConfig}>
        <App />
    </AuthProvider>
 ,
)
