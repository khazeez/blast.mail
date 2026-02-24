import { describe, it, expect } from "vitest";
import { CustomerProfileRepo } from "../repositories/CustomerProfileRepo";
import { CreateCustomerProfileSchema } from "../models/CustomerProfileSchema";

describe("CustomerProfileRepo", () => {
  it("should create a profile with required fields", async () => {
    const repo = new CustomerProfileRepo();
    const profile = await repo.create({ email: "test@example.com" });

    expect(profile.id).toBeDefined();
    expect(profile.email).toBe("test@example.com");
    expect(profile.consent).toBe(false);
    expect(profile.unsubscribed).toBe(false);
    expect(profile.createdAt).toBeDefined();
  });

  it("should create a profile with all fields", async () => {
    const repo = new CustomerProfileRepo();
    const profile = await repo.create({
      email: "john@example.com",
      firstName: "John",
      lastName: "Doe",
      segment: "premium",
      consent: true,
      customFields: { company: "Acme" },
    });

    expect(profile.firstName).toBe("John");
    expect(profile.lastName).toBe("Doe");
    expect(profile.segment).toBe("premium");
    expect(profile.consent).toBe(true);
    expect(profile.customFields?.company).toBe("Acme");
  });

  it("should get profile by id", async () => {
    const repo = new CustomerProfileRepo();
    const created = await repo.create({ email: "get@example.com" });
    const fetched = await repo.getById(created.id);

    expect(fetched).toEqual(created);
  });

  it("should return undefined for non-existent id", async () => {
    const repo = new CustomerProfileRepo();
    const fetched = await repo.getById("non-existent");

    expect(fetched).toBeUndefined();
  });

  it("should update a profile", async () => {
    const repo = new CustomerProfileRepo();
    const created = await repo.create({ email: "update@example.com" });
    const updated = await repo.update(created.id, { firstName: "Updated" });

    expect(updated?.firstName).toBe("Updated");
    expect(updated?.updatedAt).toBeDefined();
  });

  it("should delete a profile", async () => {
    const repo = new CustomerProfileRepo();
    const created = await repo.create({ email: "delete@example.com" });
    const deleted = await repo.delete(created.id);
    const fetched = await repo.getById(created.id);

    expect(deleted).toBe(true);
    expect(fetched).toBeUndefined();
  });

  it("should list all profiles", async () => {
    const repo = new CustomerProfileRepo();
    await repo.create({ email: "list1@example.com" });
    await repo.create({ email: "list2@example.com" });
    const list = await repo.list();

    expect(list.length).toBe(2);
  });
});

describe("CustomerProfileSchema validation", () => {
  it("should validate valid email", () => {
    const result = CreateCustomerProfileSchema.safeParse({ email: "valid@example.com" });
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const result = CreateCustomerProfileSchema.safeParse({ email: "invalid-email" });
    expect(result.success).toBe(false);
  });

  it("should set default values", () => {
    const result = CreateCustomerProfileSchema.parse({ email: "test@example.com" });
    expect(result.consent).toBe(false);
    expect(result.unsubscribed).toBe(false);
  });
});
