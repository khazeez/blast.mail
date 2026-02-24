import { CustomerProfile } from "../models/CustomerProfile";

type Patch = Partial<CustomerProfile>;

export class CustomerProfileRepo {
  private store: Map<string, CustomerProfile> = new Map();

  async create(data: Omit<CustomerProfile, "id" | "createdAt"> & { id?: string }): Promise<CustomerProfile> {
    const id = data.id ?? this.generateId();
    const now = new Date().toISOString();
    const profile: CustomerProfile = {
      id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      segment: data.segment,
      consent: data.consent ?? false,
      unsubscribed: data.unsubscribed ?? false,
      createdAt: now,
      updatedAt: now,
      customFields: data.customFields ?? {},
    };
    this.store.set(id, profile);
    return profile;
  }

  async getById(id: string): Promise<CustomerProfile | undefined> {
    return this.store.get(id);
  }

  async update(id: string, patch: Patch): Promise<CustomerProfile | undefined> {
    const existing = this.store.get(id);
    if (!existing) return undefined;
    const updated: CustomerProfile = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }

  async list(): Promise<CustomerProfile[]> {
    return Array.from(this.store.values());
  }

  private generateId(): string {
    // Simple random id; replace with real UUID if available
    return "cp_" + Math.random().toString(36).slice(2, 9);
  }
}
