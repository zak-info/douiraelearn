"use server"

import { connect } from "@/models/mongodb";
import User from "@/models/user.model";
import { revalidatePath } from "next/cache";
// import Usertable from "@/models/userstable.model";

export async function createMongoUser(data) {
    try {
        await connect();
        const user = await User.create(data);
        revalidatePath("/dashboard3", "page")
        return { success: true,_id:user?._id?.toString() };
    } catch (error) {
        console.error("Error creating MongoDB Usertable", error); // Log the error for debugging
        return { success: false, msg: "An unknown error occurred. " + error.message };
    }
}
export async function updateMongoUsers(_id, data) {
    try {
        await connect();
        const user = await User.updateOne({ _id }, data);
        revalidatePath("/dashboard3", "page")
        return { success: true, user };
    } catch (error) {
        console.error("Error creating MongoDB Usertable", error); // Log the error for debugging
        return { success: false, msg: "An unknown error occurred. " + error.message };
    }
}

export async function getUser(condition) {
    try {
        await connect();
        const users = await User.find(condition);
        return { success: true, users };
    } catch (error) {
        console.error("Error creating MongoDB User", error); // Log the error for debugging
        return { success: false, msg: "An unknown error occurred. " + error.message };
    }
}
export async function getUserById(condition) {
    try {
        await connect();
        const user = await User.findOne(condition);
        return { success: true, user };
    } catch (error) {
        console.error("Error creating MongoDB User", error); // Log the error for debugging
        return { success: false, msg: "An unknown error occurred. " + error.message };
    }
}


export async function deletUsere(condition) {
    try {
        await connect();
        const usere = await User.deleteOne(condition);
        revalidatePath("/dashboard/[business]/users", "page")
        return { success: true };
    } catch (error) {
        console.error("Error deleting MongoDB Cost", error); // Log the error for debugging
        return { success: false, msg: "An unknown error occurred. " + error.message };
    }
}

