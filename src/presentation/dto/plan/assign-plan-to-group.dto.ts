export interface AssignPlanToGroupDto {
  groupId: number;
  planId: string;
  startsAt?: string;
  endsAt?: string | null;
}
