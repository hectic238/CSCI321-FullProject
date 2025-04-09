// Function to set a session cookie (no expiry date)
export function setCookie(name, value) {
    document.cookie = `${name}=${value};path=/`; 
}

export function getCookie(name) {
    const nameEq = `${name}=`;
    const cookies = document.cookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
        let c = cookies[i].trim();
        if (c.indexOf(nameEq) === 0) {
            return c.substring(nameEq.length, c.length); 
        }
    }
    return null; 
}

export function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`; 
}

