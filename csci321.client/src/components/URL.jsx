export const getURL = () => {

    console.log("Environment:", process.env.NODE_ENV);
    
    if(process.env.NODE_ENV === 'development'){
        return "https://localhost:5144";
    }
    
    if(process.env.NODE_ENV === 'production'){
        return "https://ec2-3-25-57-33.ap-southeast-2.compute.amazonaws.com:5144";
    }
}