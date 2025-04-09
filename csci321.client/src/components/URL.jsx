export const getURL = () => {
    
    if(process.env.NODE_ENV === 'development'){
        return "https://bfrc7mljh3.execute-api.ap-southeast-2.amazonaws.com/api";
    }
    
    if(process.env.NODE_ENV === 'production'){
        return "https://ec2-3-25-57-33.ap-southeast-2.compute.amazonaws.com:5144";
    }
}