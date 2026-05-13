export default class User {
    constructor(id,name, email,  phone, birth) {
        this.name = name;
        this.email = email;
        this.id = id;
        this.phone = phone;
        this.birth = birth;
    }
    getName() {
    return this.name;
}
getAge() {
    const today = new Date();
    const birthDate = new Date(this.birth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
}











}
