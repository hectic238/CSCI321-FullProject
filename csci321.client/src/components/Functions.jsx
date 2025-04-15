
export const generateObjectId = () =>  {
    const timestamp = (Math.floor(new Date().getTime() / 1000)).toString(16);
    const randomHex = 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function() {
        return (Math.floor(Math.random() * 16)).toString(16);
    });

    return timestamp + randomHex;
}
