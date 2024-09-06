"use client";
import {
  Switch,
  Input,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Textarea,
} from "@nextui-org/react";

import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import "./form.css";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

// Define types for props and question structure
interface Question {
  type: string;
  text: string;
  options: string[];
  isRequired: boolean;
}

interface FormProps {
  title: string;
  description: string;
  questions: Question[];
  isFile: boolean;
}

const CreatorForm: React.FC<FormProps> = (props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<FormProps>({
    title: props.title,
    description: props.description,
    questions: [...props.questions],
    isFile: false,
  });

  const handleSendData = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("/api/creatorform", form);
      if (response.data?.success) {
        toast.success("Form created!");
        router.push(`/#recents`);
      } else {
        toast.error("Request failed, try again");
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (props) {
      setForm({ ...props });
    }
  }, [props]);

  const addQuestion = () => {
    setForm((prevForm) => ({
      ...prevForm,
      questions: [
        ...prevForm.questions,
        { type: "text", text: "New Question", options: [], isRequired: true },
      ],
    }));
  };

  const handleSwitchChange = (index: number, isRequired: boolean) => {
    const newQuestions = form.questions.map((question, i) =>
      i === index ? { ...question, isRequired: !isRequired } : question
    );
    setForm({ ...form, questions: newQuestions });
  };

  const handleInputChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const newQuestions = form.questions.map((question, i) =>
      i === index ? { ...question, text: event.target.value } : question
    );
    setForm({ ...form, questions: newQuestions });
  };

  const handleTypeChange = (index: number, newType: string | undefined) => {
    if (newType && newType !== "file") {
      const newQuestions = form.questions.map((question, i) =>
        i === index ? { ...question, type: newType, options: [] } : question
      );
      setForm({ ...form, questions: newQuestions });
    } else if (newType === "file") {
      if (form.isFile) {
        toast.error("Multiple file upload not allowed!");
      } else {
        const newQuestions = form.questions.map((question, i) =>
          i === index ? { ...question, type: newType, options: [] } : question
        );
        setForm({ ...form, questions: newQuestions, isFile: true });
      }
    }
  };

  const handleOptionChange = (
    qIndex: number,
    oIndex: number,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const newQuestions = form.questions.map((question, i) => {
      if (i === qIndex) {
        const newOptions = question.options.map((option, j) =>
          j === oIndex ? event.target.value : option
        );
        return { ...question, options: newOptions };
      }
      return question;
    });
    setForm({ ...form, questions: newQuestions });
  };

  const addOption = (qIndex: number) => {
    const newQuestions = form.questions.map((question, i) =>
      i === qIndex
        ? { ...question, options: [...question.options, "New Option"] }
        : question
    );
    setForm({ ...form, questions: newQuestions });
  };

  const deleteQuestion = (index: number) => {
    const updatedQuestions = form.questions.filter((_, i) => i !== index);
    setForm({
      ...form,
      questions: updatedQuestions,
      isFile: form.questions[index].type === "file" ? false : form.isFile,
    });
  };

  return (
    <div className="mainclass p-7 flex flex-col min-w-[390px] justify-center border-1  border-[#ccc] max-w-[740px] md:w-full text-gray-800 p-2 bg-white mt-20">
      <form onSubmit={handleSendData}>
        <div className="rounded-lg">
          <div className="p-1 mb-2 rounded-md">
            <div className="mb-5">
              <label className="block text-lg font-semibold mb-1.5">
                Title of form
              </label>
              <Input
                radius="none"
                type="text"
                className="w-full border-1 border-[#ccc] max-w-4xl"
                value={form.title}
                size="lg"
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1.5">Description of form</label>
              <Textarea
                radius="none"
                minRows={2}
                className="max-w-4xl w-full border-1 m-0 border-[#ccc]"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
          </div>
          <div className="p-1 text-xs mb-2">
            {form.questions.map((question, qIndex) => (
              <div key={qIndex} className="lg:mb-4 p-4  border-1 border-[#ccc]">
                <div className="flex justify-between items-center">
                  <label className="block">Question</label>
                  <Button
                    className="bg-white"
                    color="danger"
                    variant="flat"
                    size="sm"
                    onClick={() => deleteQuestion(qIndex)}
                  >
                    Delete
                  </Button>
                </div>
                <Input
                  radius="none"
                  type="text"
                  className="w-full border-1 m-0 border-[#ccc] text-small mb-4"
                  value={question.text}
                  size="sm"
                  onChange={(e) => handleInputChange(qIndex, e)}
                />
                <div className="flex justify-end items-center h-5 m-1.5">
                  <div className="flex justify-between items-center sm:h-3 scale-[90%] lg:gap-4 sm:gap-2">
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          variant="bordered"
                          className="capitalize"
                          size="sm"
                        >
                          {question.type}
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label="Single selection example"
                        variant="flat"
                        disallowEmptySelection
                        selectionMode="single"
                        onSelectionChange={(event) =>
                          handleTypeChange(
                            qIndex,
                            event.anchorKey?.toString()
                          )
                        }
                      >
                        <DropdownItem key="text" value="text">
                          Text
                        </DropdownItem>
                        <DropdownItem key="number" value="number">
                          Number
                        </DropdownItem>
                        <DropdownItem key="date" value="date">
                          Date
                        </DropdownItem>
                        <DropdownItem key="time" value="time">
                          Time
                        </DropdownItem>
                        {!form.isFile && (
                          <DropdownItem key="file" value="file">
                            File
                          </DropdownItem>
                        )}
                        <DropdownItem key="radio" value="radio">
                          Radio
                        </DropdownItem>
                        <DropdownItem key="checkbox" value="checkbox">
                          Checkbox
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                    <Switch
                      defaultSelected
                      isSelected={question.isRequired}
                      onChange={() =>
                        handleSwitchChange(qIndex, question.isRequired)
                      }
                      size="sm"
                    >
                      Required
                    </Switch>
                  </div>
                </div>
                <div className="flex flex-col">
                  {(question.type === "radio" ||
                    question.type === "checkbox") && (
                    <div className="flex flex-wrap">
                      {question.options.map((option, oIndex) => (
                        <div
                          key={oIndex}
                          className="flex gap-2 scale-[95%] ml-[-8px]"
                        >
                          <label
                            htmlFor=""
                            className="items-center justify-center pt-1.5 text-medium"
                          >
                            {oIndex + 1}
                          </label>
                          <Input
                            size="sm"
                            radius="none"
                            isRequired={true}
                            type="text"
                            className="mt-1 max-w-4xl w-full border-1 border-[#ccc]"
                            value={option}
                            onChange={(e) =>
                              handleOptionChange(qIndex, oIndex, e)
                            }
                          />
                        </div>
                      ))}
                      <Button
                        variant="flat"
                        size="sm"
                        onClick={() => addOption(qIndex)}
                      >
                        Add option
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <Button
              variant="bordered"
              size="sm"
              className="mt-5"
              onClick={addQuestion}
            >
              Add question
            </Button>
          </div>
        </div>
        <div className="flex justify-center m-2 p-4">
          <Button
            isLoading={loading}
            loadingText="Creating form"
            type="submit"
            color="primary"
            className="mx-auto"
          >
            Create form
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatorForm;
