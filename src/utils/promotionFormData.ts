// src/utils/promotionFormData.ts
export type PromotionPayload = {
  title: string;
  description: string;
  fromDate: string;
  toDate: string;
  photo?: File | null;
};

export const buildPromotionFormData = (
  payload: PromotionPayload
): FormData => {
  const fd = new FormData();

  fd.append("title", payload.title);
  fd.append("description", payload.description);
  fd.append("from_date", payload.fromDate);
  fd.append("to_date", payload.toDate);

  if (payload.photo) {
    fd.append("photo", payload.photo);
  }

  return fd;
};