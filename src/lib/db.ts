import mongoose from "mongoose";

const mongodbUrl = process.env.MONGODB_URL || "";

if (!mongodbUrl) {
      throw new Error("MONGODB_URL is not defined in environment variables");
}

let cached = global.mongoose;
if(!cached){
      cached = global.mongoose = {conn: null, promise: null};
}

const connectDb = async () => {
      if(cached.conn){
            return cached.conn;
      }

      if(!cached.promise){
            cached.promise = mongoose.connect(mongodbUrl).then((conn) => conn.connection);
      }

      try {
            cached.conn = await cached.promise;
            return cached.conn;
      } catch (error) {
            console.log(error);
      }
}

export default connectDb;
