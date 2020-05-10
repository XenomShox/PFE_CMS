let today = new Date();
let someday = new Date(today.getTime());
someday.setDate(someday.getDate() - 2)

console.log(today)
console.log(someday)

function isExpired(date, days){
    let now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffInDays = diff / (1000*3600*24)
    
    return diffInDays >= days;
}
console.log(isExpired(someday, 5))