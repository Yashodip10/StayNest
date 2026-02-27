const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const MONGO_URL="mongodb://localhost:27017/wanderlust";

async function main(){
    await mongoose.connect(MONGO_URL);
}

main().then(()=>{
    console.log("connection sucessfull..");
}).catch((err)=>{
    console.log(err)
}); 

const listingSchema=new Schema({
    title:{
        type:String,
        require:true   
    },
    description:String,
   image: {
        filename: {
            type: String,
            default: "listingimage"
        },
        url: {
            type: String,
            default: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=800&q=60"
        }
    },
    price:Number,
    location:String,
    country:String
});

const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;