// src/utils/menuFormData.ts
export type MenuPayload = {
  name: string;
  description: string;
  price: number | string;
  categoryId: number;
  photo?: File | null;
};

export const buildMenuFormData = (payload: MenuPayload) => {
  const fd = new FormData();

  fd.append("name", payload.name);
  fd.append("description", payload.description);
  fd.append("price", String(payload.price));
  fd.append("categoryId", String(payload.categoryId));

  if (payload.photo) {
    fd.append("photo", payload.photo);
  }

  return fd;
};