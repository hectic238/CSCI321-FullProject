// mockBackend.js
const users = [];

export const signUpUser = (formData) => {
    users.push(formData);
    return Promise.resolve({ success: true });
};

export const signInUser = (email, password, userType) => {
    const user = users.find(user => user.email === email && user.password === password && user.userType === userType);
    if (user) {
        return Promise.resolve({ success: true, user });
    }
    return Promise.reject({ success: false, message: "Invalid email or password" });
};