import React from "react";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardContent,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Loader } from "lucide-react";
import Link from "next/link";

const CustomForm = ({
  formName,
  buttonText,
  inputs,
  className,
  isValidForm,
  children,
  formError,
  handleSubmit,
  action,
  disabled,
  footerText,
  footerTextButtonType,
  footerNavigationLink,
}) => {
  return (
    <Card className={`sm:w-[30rem]  w-9/12 flex flex-col  ${className}`}>
      <form onSubmit={handleSubmit} action={action} className="">
        <CardHeader className="items-center">
          <CardTitle>{formName}</CardTitle>
        </CardHeader>
        {formError && formError.length > 1 && (
          <h1 className="text-sm mb-[0.1rem] opacity-80  max-sm:w-72 dark:text-red-500 text-destructive font-medium flex items-center justify-center">
            {formError}
          </h1>
        )}
        <div className="sm:w-8/12 w-11/12 flex flex-col mx-auto">
          {inputs &&
            inputs.map((input, index) => (
              <CardContent key={index} className=" pb-0 mb-1">
                <h1 className="text-xs mb-[0.1rem] opacity-70 h-5 max-sm:w-72 text-foreground font-light sm:flex sm:items-center sm:justify-center">
                  {input.error ? input.error : ""}
                </h1>
                <Input
                  value={input?.value}
                  onChange={input?.onChange}
                  type={input?.type}
                  id={input?.id}
                  placeholder={input?.placeholder}
                  name={input?.name}
                  disabled={disabled}
                  maxLength={input?.maxLength}
                />
              </CardContent>
            ))}
          <CardContent>{children}</CardContent>

          <CardFooter className="flex flex-col items-center  ">
            <div className="flex items-center justify-around sm:pt-5 w-full -mt-5">
              <Button
                type="submit"
                disabled={!isValidForm || disabled}
                className="w-5/12 max-sm:mt-2 disabled:cursor-not-allowed  "
              >
                {disabled ? <Loader className="animate-spin" /> : buttonText}
              </Button>
            </div>
            {footerText && (
              <h1 className="text-sm mt-4 flex tracking-tight  text-center opacity-85 -mb-4">
                {footerText} -
                <Link
                  replace={true}
                  href={footerNavigationLink}
                  className="text-blue-500 tracking-normal hover:cursor-pointer ml-2 font-semibold "
                >
                  {footerTextButtonType}
                </Link>
              </h1>
            )}
          </CardFooter>
        </div>
      </form>
    </Card>
  );
};

export default CustomForm;
