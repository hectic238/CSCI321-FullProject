
// function to get the users auth token
export const getToken = () => {
    const storedData = sessionStorage.getItem("oidc.user:https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_i8rut828H:71jdc4b1eh18i8d6f4194f7b1p")

    if(storedData) {
        try {
            const parsedData = JSON.parse(storedData);

            return parsedData.id_token || "";
        }
        catch (error) {
            console.error("Cannot Parse Session Storage")
        }
    }
}

