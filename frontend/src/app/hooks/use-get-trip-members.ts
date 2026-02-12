import { useAppSelector } from "@/store";
import { useGetTripmates } from "../trip/[tripId]/@overview/hooks/invite/use-get-tripmates"

export const useGetTripMembers = (tripId: number) => {
    const { data: tripmates } = useGetTripmates(tripId)
    const joinedTripmates = (tripmates?.joined ?? []).map(j => j.user);

    const tripOverview = useAppSelector((s) => s.tripDetail.overview)
    const tripOwner = tripOverview?.owner;

    if (!tripOwner) return [];

    return [tripOwner, ...joinedTripmates]
}