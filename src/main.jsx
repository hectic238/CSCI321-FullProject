import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from 'react-oidc-context'

// Dynamically set redirect URI based on environment
const redirectUri =
    import.meta.env.MODE === 'development'
        ? 'https://localhost:5173/redirect'
        : 'https://aws-production.deyr091sxurr5.amplifyapp.com/redirect'

const cognitoAuthConfig = {
    authority: 'https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_i8rut828H',
    client_id: '71jdc4b1eh18i8d6f4194f7b1p',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'email openid phone',
}

createRoot(document.getElementById('root')).render(
    <AuthProvider {...cognitoAuthConfig}>
        <App />
    </AuthProvider>
)
