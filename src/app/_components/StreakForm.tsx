"use client";
import { useState } from "react";
import { api } from "~/trpc/react";

// Types
type Task = {
  name: string;
  startDate: string;
  endDate: string;
  streak: number;
};

// Main Form
export const StreakForm = () => {
  const initialState: Task = {
    name: "",
    startDate: "",
    endDate: "",
    streak: 0,
  };
  const [task, setTask] = useState<Task>(initialState);
  const [errors, setErrors] = useState<Partial<Task>>({});
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false); // Added state for form visibility

  // Validation Function
  const validate = (updatedTask: Task = task): boolean => {
    const newErrors: Partial<Task> = {};
    if (!updatedTask.name) newErrors.name = "Task Title is required";
    if (!updatedTask.startDate) newErrors.startDate = "Start Date is required";
    if (!updatedTask.endDate) newErrors.endDate = "End Date is required";
    if (
      updatedTask.startDate &&
      updatedTask.endDate &&
      updatedTask.startDate > updatedTask.endDate
    ) {
      newErrors.endDate = "End Date cannot be earlier than Start Date";
    }
    setErrors(newErrors);
    const formValid = !Object.keys(newErrors).length;
    setIsFormValid(formValid);
    return formValid;
  };

  // On Change Function
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedTask = { ...task, [name as keyof Task]: value };
    setTask(updatedTask);
    validate(updatedTask);
  };

  // Server post function
  const utils = api.useUtils();
  const createTask = api.task.create.useMutation({
    onSuccess: async () => {
      await utils.task.invalidate();
      setTask(initialState);
      setErrors({});
      setIsFormValid(false);
      setIsFormVisible(false); // Hide form after successful submission
    },
  });

  // Submit Function
  const handleSubmit = () => {
    if (validate()) {
      createTask.mutate(task);
    }
  };

  // Toggle Form Visibility
  const toggleFormVisibility = () => {
    setIsFormVisible((prev) => !prev);
  };

  return (
    <div>
      {isFormVisible ? (
        <div>
          <button onClick={toggleFormVisibility} className="btn btn-secondary">
            CLOSE
          </button>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: "10px",
            }}
          >
            {["name", "startDate", "endDate"].map((field) => (
              <div key={field} style={{ margin: "3px" }}>
                <input
                  type={field === "name" ? "text" : "date"}
                  name={field}
                  value={task[field as keyof Task]}
                  onChange={handleChange}
                  placeholder={field === "name" ? "Task Title" : ""}
                  style={{ height: "40px" }} // Set consistent height
                />
                {errors[field as keyof Task] && (
                  <p className="text-red-500">{errors[field as keyof Task]}</p>
                )}
              </div>
            ))}
            <button
              onClick={handleSubmit}
              className="btn btn-primary"
              disabled={!isFormValid}
            >
              ADD TASK
            </button>
          </div>
        </div>
      ) : (
        <button onClick={toggleFormVisibility} className="btn btn-primary">
          ADD NEW TASK
        </button>
      )}
    </div>
  );
};
