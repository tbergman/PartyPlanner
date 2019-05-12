import React from 'react';
import { Form, Button } from 'antd';
import { Field, FormikProps } from 'formik';
import FormikInputField from '@shared/formikInputField';
import { ApolloError } from 'apollo-boost';
import { ResetPasswordFormValues } from '@pages/reset-password';
import GraphqlError from '@components/GraphqlError';

interface Props {
  loading: boolean;
  error: ApolloError | undefined;
  handleSubmit: FormikProps<ResetPasswordFormValues>['handleSubmit'];
}

const ResetPasswordForm: React.FC<Props> = props => {
  return (
    <Form onSubmit={props.handleSubmit}>
      <Field
        name="password"
        type="password"
        placeholder="Your new password"
        component={FormikInputField}
        size="large"
      />
      <Field
        name="confirmPassword"
        type="password"
        placeholder="Confirm your new password"
        component={FormikInputField}
        size="large"
      />
      <Button
        loading={props.loading}
        type="primary"
        size="large"
        block={true}
        htmlType="submit"
      >
        Reset your password
      </Button>
      <div style={{ marginTop: 24 }}>
        <GraphqlError error={props.error} />
      </div>
    </Form>
  );
};

export default ResetPasswordForm;