import { redirect } from "next/navigation";
import { DEFAULT_VIRTUAL_TOUR_SLUG } from "@/lib/virtual-tours";

export default function VirtualTourPage() {
  redirect(`/virtual-tour/${DEFAULT_VIRTUAL_TOUR_SLUG}`);
}
