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
  useRemoveFacultyMutation,
  useRemoveProgramMutation,
  useRemoveStatusMutation,
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
  const [removeFaculty] = useRemoveFacultyMutation();
  const [removeProgram] = useRemoveProgramMutation();
  const [removeStatus] = useRemoveStatusMutation();

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

  const handleDeleteCategory = async (type: string, id: number) => {
    switch (type) {
      case "faculty":
        await removeFaculty(id);
        break;
      case "program":
        await removeProgram(id);
        break;
      case "status":
        await removeStatus(id);
        break;
    }
  };

  return {
    facultiesData,
    statusesData,
    programsData,
    handleAddCategory,
    handleEditCategory,
    handleDeleteCategory,
  };
};
