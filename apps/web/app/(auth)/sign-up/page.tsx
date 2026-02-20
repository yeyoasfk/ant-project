import AuthForm from "../../../components/AuthForm";

const SignUp = () => {
  return (
    <section className="flex items-center justify-center w-full">
      <div className="w-full max-w-md md:max-w-lg">
        <AuthForm type="sign-up" />
      </div>
    </section>
  )
}

export default SignUp