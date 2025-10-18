"use server";

import { connect } from "@/models/mongodb";
import User from "@/models/user.model";
import { revalidatePath } from "next/cache";
import type { User as UserType, Professor, CreateProfessorForm, ApiResponse } from "@/types/user.types";

// ========== Generic User Actions ==========

export async function createMongoUser(data: Partial<UserType>): Promise<ApiResponse<{ _id: string }>> {
  try {
    await connect();
    const user = await User.create(data);
    revalidatePath("/dashboard3", "page");
    return {
      success: true,
      data: { _id: user?._id?.toString() },
      message: "User created successfully"
    };
  } catch (error: any) {
    console.error("Error creating MongoDB User", error);
    return {
      success: false,
      error: error.message || "An unknown error occurred"
    };
  }
}

export async function updateMongoUsers(_id: string, data: Partial<UserType>): Promise<ApiResponse> {
  try {
    await connect();
    const user = await User.updateOne({ _id }, data);
    revalidatePath("/dashboard3", "page");
    return {
      success: true,
      data: user,
      message: "User updated successfully"
    };
  } catch (error: any) {
    console.error("Error updating MongoDB User", error);
    return {
      success: false,
      error: error.message || "An unknown error occurred"
    };
  }
}

export async function getUser(condition: Partial<UserType> = {}): Promise<ApiResponse<UserType[]>> {
  try {
    await connect();
    const users = await User.find(condition).lean();
    // Convert MongoDB documents to plain objects and serialize _id
    const serializedUsers: any[] = users.map((user: any) => ({
      ...user,
      _id: user._id?.toString(),
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
    }));
    return {
      success: true,
      data: serializedUsers
    };
  } catch (error: any) {
    console.error("Error fetching MongoDB Users", error);
    return {
      success: false,
      error: error.message || "An unknown error occurred"
    };
  }
}

export async function getUserById(condition: Partial<UserType>): Promise<ApiResponse<UserType>> {
  try {
    await connect();
    const user = await User.findOne(condition).lean();
    if (!user) {
      return {
        success: false,
        error: "User not found"
      };
    }
    // Serialize the user object
    const serializedUser: any = {
      ...user,
      _id: (user as any)._id.toString(),
      createdAt: (user as any).createdAt?.toISOString(),
      updatedAt: (user as any).updatedAt?.toISOString(),
    };
    return {
      success: true,
      data: serializedUser
    };
  } catch (error: any) {
    console.error("Error fetching MongoDB User", error);
    return {
      success: false,
      error: error.message || "An unknown error occurred"
    };
  }
}

export async function deleteUser(condition: Partial<UserType>): Promise<ApiResponse> {
  try {
    await connect();
    const result = await User.deleteOne(condition);
    if (result.deletedCount === 0) {
      return {
        success: false,
        error: "User not found"
      };
    }
    revalidatePath("/dashboard3", "page");
    return {
      success: true,
      message: "User deleted successfully"
    };
  } catch (error: any) {
    console.error("Error deleting MongoDB User", error);
    return {
      success: false,
      error: error.message || "An unknown error occurred"
    };
  }
}

// ========== Professor-Specific Actions ==========

export async function createProfessor(formData: CreateProfessorForm): Promise<ApiResponse<{ _id: string }>> {
  try {
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email) {
      return {
        success: false,
        error: "First name, last name, and email are required"
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return {
        success: false,
        error: "Invalid email format"
      };
    }

    await connect();

    // Check if email already exists
    const existingUser = await User.findOne({ email: formData.email });
    if (existingUser) {
      return {
        success: false,
        error: "A user with this email already exists"
      };
    }

    // Create professor with type
    const professorData: Partial<Professor> = {
      ...formData,
      type: "professor",
      data: {
        department: formData.department,
        modules: formData.modules,
        specialization: formData.specialization,
      }
    };

    const professor = await User.create(professorData);
    revalidatePath("/");

    return {
      success: true,
      data: { _id: professor._id.toString() },
      message: "Professor created successfully"
    };
  } catch (error: any) {
    console.error("Error creating professor:", error);
    return {
      success: false,
      error: error.message || "Failed to create professor"
    };
  }
}

export async function getProfessors(): Promise<ApiResponse<Professor[]>> {
  try {
    await connect();
    const professors = await User.find({ type: "professor" }).lean();

    // Serialize the professors
    const serializedProfessors: any[] = professors.map((prof: any) => ({
      ...prof,
      _id: prof._id?.toString(),
      createdAt: prof.createdAt?.toISOString(),
      updatedAt: prof.updatedAt?.toISOString(),
      department: prof.data?.department || "",
      modules: prof.data?.modules || "",
      specialization: prof.data?.specialization || "",
    }));

    return {
      success: true,
      data: serializedProfessors
    };
  } catch (error: any) {
    console.error("Error fetching professors:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch professors"
    };
  }
}

export async function updateProfessor(_id: string, formData: Partial<CreateProfessorForm>): Promise<ApiResponse> {
  try {
    await connect();

    // If email is being updated, check for duplicates
    if (formData.email) {
      const existingUser = await User.findOne({
        email: formData.email,
        _id: { $ne: _id }
      });

      if (existingUser) {
        return {
          success: false,
          error: "A user with this email already exists"
        };
      }
    }

    const updateData: Partial<Professor> = {
      ...formData,
      data: {
        department: formData.department,
        modules: formData.modules,
        specialization: formData.specialization,
      }
    };

    const result = await User.updateOne({ _id }, updateData);

    if (result.matchedCount === 0) {
      return {
        success: false,
        error: "Professor not found"
      };
    }

    revalidatePath("/");

    return {
      success: true,
      message: "Professor updated successfully"
    };
  } catch (error: any) {
    console.error("Error updating professor:", error);
    return {
      success: false,
      error: error.message || "Failed to update professor"
    };
  }
}

export async function deleteProfessor(_id: string): Promise<ApiResponse> {
  try {
    await connect();
    const result = await User.deleteOne({ _id, type: "professor" });

    if (result.deletedCount === 0) {
      return {
        success: false,
        error: "Professor not found"
      };
    }

    revalidatePath("/");

    return {
      success: true,
      message: "Professor deleted successfully"
    };
  } catch (error: any) {
    console.error("Error deleting professor:", error);
    return {
      success: false,
      error: error.message || "Failed to delete professor"
    };
  }
}
