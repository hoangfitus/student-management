import {
  useGetFacultiesQuery,
  useGetStatusesQuery,
  useGetProgramsQuery,
  useAddFacultyMutation,
  useAddProgramMutation,
  useAddStatusMutation,
  useUpdateFacultyMutation,
  useUpdateProgramMutation,
  useUpdateStatusMutation,
} from "@app/services/category";

export const useCategories = () => {
  const { data: facultiesData } = useGetFacultiesQuery();
  const { data: statusesData } = useGetStatusesQuery();
  const { data: programsData } = useGetProgramsQuery();

  const [addFaculty] = useAddFacultyMutation();
  const [addProgram] = useAddProgramMutation();
  const [addStatus] = useAddStatusMutation();
  const [updateFaculty] = useUpdateFacultyMutation();
  const [updateProgram] = useUpdateProgramMutation();
  const [updateStatus] = useUpdateStatusMutation();

  const handleAddCategory = async (type: string, name: string) => {
    switch (type) {
      case "faculty":
        await addFaculty({ name });
        break;
      case "program":
        await addProgram({ name });
        break;
      case "status":
        await addStatus({ name });
        break;
    }
  };

  const handleEditCategory = async (type: string, id: number, name: string) => {
    switch (type) {
      case "faculty":
        await updateFaculty({ id, name });
        break;
      case "program":
        await updateProgram({ id, name });
        break;
      case "status":
        await updateStatus({ id, name });
        break;
    }
  };

  return {
    facultiesData,
    statusesData,
    programsData,
    handleAddCategory,
    handleEditCategory,
  };
};
