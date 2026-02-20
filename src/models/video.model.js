import mongoose, {Schema} from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
     videoFile: {
      type: String, // Cloudinary video URL
      required: true,
    },

    thumbnail: {
      type: String, // Cloudinary image URL
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    duration: {
      type: Number, // duration in seconds
      required: true,
    },

    views: {
      type: Number,
      default: 0,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

videoSchema.plugin(aggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);