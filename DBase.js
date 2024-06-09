import Realm from 'realm';

// Define the schema for the user table
export const StudentSchema = {
  name: 'Student',
  primaryKey: 'stu_id',
  properties: {
    stu_id: 'int',
    stu_name: 'string',
    stu_password: 'string',
    major_name: 'Major',
    chatRooms: 'ChatRoom[]',
  },
};
export const ChatRoomSchema = {
  name: 'ChatRoom',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    description: 'string',
    major_name: 'Major',
    member: 'Student[]',
    messages: {
      type: 'linkingObjects',
      objectType: 'Message',
      property: 'chatRoomId',
    },
  },
};
export const MessageSchema = {
  name: 'Message',
  primaryKey: 'id',
  properties: {
    id: 'int',
    chatRoomId: 'ChatRoom',
    senderId: 'Student',
    text: 'string',
    timestamp: 'date',
  },
};

export const MajorSchema = {
  name: 'Major',
  primaryKey: 'Major_id',
  properties: {
    Major_id: 'int', 
    major_name: { type: 'string', indexed: true}, 
    courses: { type: 'list', objectType: 'Course' }
  },
};

export const MaterialSchema = {
  name: 'Material',
  primaryKey: 'mat_id',
  properties: {
    mat_id: { type: 'int',   indexed: true  },
    mat_content: 'string', 
    matt_name:'string',
    course_name: 'string',
  },
};

export const CourseSchema = {
  name: 'Course',
  primaryKey: 'Course_id',
  properties: {
    Course_id: { type: 'int', indexed: true },
    Course_name: 'string',
    majors: { type: 'list', objectType: 'Major' },
    
  },
};

export const StudentCourseSchema = {
  name: 'StudentCourse',
  primaryKey: 'ID',
  properties: {
    ID: { type: 'int', indexed: true },
    Course_id: 'Course',
    stu_id: 'Student',
  },
};
const MajorCourseSchema = {
  name: 'StudentCourse',
  primaryKey: 'ID',
  properties: {
    ID: { type: 'objectId', primaryKey: true, default: 0 },
    Course_id: 'Course',
    Major_id: 'Major',
  },
};

const realmOptions = {
  path: 'myuni123488882227788.realm', 
  schema: [StudentSchema, MajorSchema, MaterialSchema, CourseSchema,StudentCourseSchema,ChatRoomSchema,MessageSchema],
  schemaVersion: 1,
};

export const initializeRealm = async () => {
  try {
    const realm = await Realm.open(realmOptions);
    return realm;
  } catch (error) {
    console.error('Error initializing Realm:', error);
    throw error;
  }
};
