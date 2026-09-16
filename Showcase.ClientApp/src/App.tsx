import { useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  ConfirmationModal,
  DataTable,
  DescriptionList,
  Divider,
  EmptyState,
  Form,
  Grid,
  IconButton,
  Image,
  Input,
  PageContainer,
  PageHeader,
  Pagination,
  Select,
  Skeleton,
  Stack,
  Switch,
  Textarea,
  Toast,
} from "./components/ui";

function App() {
  const [toastVisible, setToastVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [switchChecked, setSwitchChecked] = useState(false);
  const [page, setPage] = useState(1);

  const demoData = [
    ["1", "Portfolio Website", <Badge variant="success">Active</Badge>],
    ["2", "Mobile App UI", <Badge variant="default">Draft</Badge>],
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageContainer>
        <PageHeader
          title="UI Primitive Showcase"
          description="A demonstration of all the core UI components generated from the plan."
          actions={
            <>
              <Button variant="outline" onClick={() => setToastVisible(true)}>
                Show Toast
              </Button>
              <Button variant="primary" onClick={() => setModalVisible(true)}>
                Show Modal
              </Button>
            </>
          }
        />

        <Stack space="space-y-12">
          {/* Data Display Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">1. Data Display & Layout</h2>
            <Divider className="mb-6" />
            <Grid>
              <Card className="p-6">
                <Stack>
                  <div className="flex items-center gap-4">
                    <Avatar initials="JD" />
                    <div>
                      <h3 className="font-medium">John Doe</h3>
                      <p className="text-sm text-gray-500">Developer</p>
                    </div>
                  </div>
                  <DescriptionList
                    items={[
                      { label: "Role", value: "Admin" },
                      { label: "Status", value: <Badge variant="success">Active</Badge> },
                    ]}
                  />
                </Stack>
              </Card>

              <Card className="p-4 flex items-center justify-center bg-gray-100">
                <Skeleton className="w-full h-32" />
              </Card>

              <Card className="p-4">
                <Image
                  src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300&h=200&fit=crop"
                  alt="Demo Image"
                  className="w-full h-32 object-cover mb-4"
                />
                <Badge variant="primary" className="mb-2">
                  Featured
                </Badge>
                <p className="text-sm text-gray-600">This is a showcase image card.</p>
              </Card>
            </Grid>
          </section>

          {/* Data Table Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">2. Tables & Pagination</h2>
            <Divider className="mb-6" />
            <Card>
              <DataTable columns={["ID", "Project Name", "Status"]} data={demoData} />
              <Pagination currentPage={page} totalPages={5} onPageChange={setPage} />
            </Card>
          </section>

          {/* Forms Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">3. Forms & Inputs</h2>
            <Divider className="mb-6" />
            <Card className="p-6 max-w-2xl">
              <Form>
                <Stack>
                  <Input label="Project Title" placeholder="e.g. My Website" />
                  <Textarea label="Description" placeholder="Write a short description..." />
                  <Select
                    label="Category"
                    options={[
                      { label: "Web Development", value: "web" },
                      { label: "Design", value: "design" },
                    ]}
                  />
                  <Switch label="Make this project public" checked={switchChecked} onChange={setSwitchChecked} />
                  <div className="pt-4 flex gap-3">
                    <Button variant="primary">Save Changes</Button>
                    <Button variant="ghost">Cancel</Button>
                    <IconButton icon="🗑️" variant="danger" />
                  </div>
                </Stack>
              </Form>
            </Card>
          </section>

          {/* Empty States Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">4. Empty States</h2>
            <Divider className="mb-6" />
            <EmptyState
              title="No projects found"
              description="Get started by creating a new project."
              action={<Button variant="outline">+ New Project</Button>}
            />
          </section>
        </Stack>
      </PageContainer>

      {/* Global Overlays */}
      <ConfirmationModal
        isOpen={modalVisible}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        onConfirm={() => setModalVisible(false)}
        onCancel={() => setModalVisible(false)}
      />

      {toastVisible && <Toast message="Action completed successfully!" onClose={() => setToastVisible(false)} />}
    </div>
  );
}

export default App;
