import AuthForm from "../../../components/AuthForm";

const SignIn = () => {
  return (
    <section className="flex items-center justify-center w-full">
      <div className="w-full max-w-md md:max-w-lg">
        <AuthForm type="sign-in" />
      </div>
    </section>
  )
}

export default SignIn