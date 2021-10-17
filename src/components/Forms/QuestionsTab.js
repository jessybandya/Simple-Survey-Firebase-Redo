import React,{useState,useEffect} from 'react'
//import QuestionHeader from './QuestionHeader';
import {Grid} from '@material-ui/core';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { Paper, Typography } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import CropOriginalIcon from '@material-ui/icons/CropOriginal';
import CloseIcon from '@material-ui/icons/Close';
import Radio from '@material-ui/core/Radio';
import PropTypes from 'prop-types';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import AccordionActions from '@material-ui/core/AccordionActions';
import Divider from '@material-ui/core/Divider';
import VisibilityIcon from '@material-ui/icons/Visibility';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import FilterNoneIcon from '@material-ui/icons/FilterNone';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';
import ImageUplaodModel from './ImageUplaodModel';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import SaveIcon from '@material-ui/icons/Save';
import { toast, ToastContainer } from 'react-toastify'
import { db, auth } from "../firebase"
import { motion } from "framer-motion"
import { useDispatch,useSelector } from 'react-redux';
import PublishIcon from '@mui/icons-material/Publish';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import { styled } from '@mui/material/styles';


const containerVariants = {
    hidden:{
     opacity:0,
      x: '100vw',
    },
    visible:{
      opacity:1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300
      }
    }
  }

  const submitBtns = {
    hidden:{
      opacity:0,
       x: '-100vw',
     },
     visible:{
       opacity:1,
       x: 0,
       transition: {
         type: 'spring',
         delay: 2.0
       }
     },
     exit:{
       x: '-100vw',
       transition:{
         ease: 'easeOut'
       }
     }
  }




function QuestionsTab({setFormTitle, formDescription, formTitle, setFormDescription}) {

  const [questions, setQuestions]= React.useState([]);
  const [openUploadImagePop, setOpenUploadImagePop] = React.useState(false);
  const [imageContextData, setImageContextData] = React.useState({question: null, option: null});
  const [formData, setFormData] = React.useState({});
  const [loadingFormData, setLoadingFormData] = React.useState(true);
  let {user} = useSelector((state)=> ({...state}));
  const [loading, setLoading] = useState(false)
  const [open1, setOpen1] = React.useState(false);

  const [profileUserData, setProfileUserData] = useState();
  var test = profileUserData?.username
  console.log("Uid: ",test)


  const currentUserId= `${auth?.currentUser?.uid}`

  useEffect(() => {
    db.collection('users').doc(`${currentUserId}`).onSnapshot((doc) => {
        setProfileUserData(doc.data());
    });
}, [])
  const addData = (e) =>{
      e.preventDefault();
      setLoading(true)

      if(!questions[0]){
        setLoading(false)
        toast.error("You cannot submit a survey without any question!")
      }else{
        db.collection('surveys').add({
            //
           questions,
           timestamp:  Date.now(),
           formTitle,
           formDescription,
           ownerId:auth?.currentUser?.uid,
           ownerEmail:auth?.currentUser?.email,
           active:true,
           read:false,
     
        }).then(ref =>{
          setLoading(false)
          toast.success("Survey Form submitted successfully")})
        setQuestions([])
        setFormDescription("")
        setFormTitle("")
      }
  }


  

  function saveQuestions(){
    console.log("auto saving questions initiated");
    var data = {
      formId: formData._id,
      name: formData.name,
      description: formData.description,
      questions: questions
    }
    
  }

  function checkImageHereOrNotForQuestion(gg){
   // console.log(gg);
    if ((gg === undefined)||(gg==="")){
      return false;
    } else{
      return true;
    }
  }

  function checkImageHereOrNotForOption(gg){
   // console.log(gg);
    if ((gg === undefined)||(gg==="")){
      return false;
    } else{
      return true;
    }
  }

  function addMoreQuestionField(){
      expandCloseAll(); //I AM GOD

      setQuestions(questions=> [...questions, {questionText: "Question", options : [{optionText: "Option 1"}], open: true}]);
  }

  function copyQuestion(i){
    let qs = [...questions]; 
    expandCloseAll();
    const myNewOptions = [];
    qs[i].options.forEach(opn => {
      if ((opn.optionImage !== undefined)||(opn.optionImage !=="")) {
        var opn1new = {
          optionText : opn.optionText,
          optionImage: opn.optionImage
        }
      } else{
        var opn1new = {
          optionText : opn.optionText
        }
      }
      myNewOptions.push(opn1new)
    });
    const qImage = qs[i].questionImage || "";
    var newQuestion = {questionText: qs[i].questionText, questionImage : qImage ,options:myNewOptions, open: true}
     setQuestions(questions=> [...questions, newQuestion]); 
  }

  const handleImagePopupOpen = () => {
    setOpenUploadImagePop(true);
  };


  function uploadImage(i, j){
    
    setImageContextData({
      question: i,
      option: j
    });
    handleImagePopupOpen();
    
  }
  

  function updateImageLink(link, context){
    
    var optionsOfQuestion = [...questions];
    var i = context.question

    if (context.option == null) {
      optionsOfQuestion[i].questionImage= link;
    } else {
      var j = context.option
      optionsOfQuestion[i].options[j].optionImage = link;
    }
    setQuestions(optionsOfQuestion);
  }

  function deleteQuestion(i){
    let qs = [...questions]; 
    if(questions.length > 1){
      qs.splice(i, 1);
    }
    setQuestions(qs)
  }

  function handleOptionValue(text,i, j){
    var optionsOfQuestion = [...questions];
    optionsOfQuestion[i].options[j].optionText = text;
    //newMembersEmail[i]= email;
      setQuestions(optionsOfQuestion);
  }

  function handleQuestionValue(text, i){
    var optionsOfQuestion = [...questions];
    optionsOfQuestion[i].questionText = text;
      setQuestions(optionsOfQuestion);
  }

 function onDragEnd(result) {
  if (!result.destination) {
    return;
  }
  var itemgg = [...questions];

  const itemF = reorder(
    itemgg,
    result.source.index,
    result.destination.index
  );

  setQuestions(itemF);
  }

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  function showAsQuestion(i){
    let qs = [...questions];  
     qs[i].open = false;
     setQuestions(qs);
  }

  function addOption(i){
    var optionsOfQuestion = [...questions];
    if(optionsOfQuestion[i].options.length < 5){
      optionsOfQuestion[i].options.push({optionText: "Option " + (optionsOfQuestion[i].options.length + 1)})
    } else{
      console.log("Max  5 options ");  
    }
    //console.log(optionsOfQuestion);
    setQuestions(optionsOfQuestion)
  }

  function removeOption(i, j){
    var optionsOfQuestion = [...questions];
    if(optionsOfQuestion[i].options.length > 1){
      optionsOfQuestion[i].options.splice(j, 1);
      setQuestions(optionsOfQuestion)
      console.log(i + "__" + j);
    }   
  }

  function expandCloseAll(){
    let qs = [...questions]; 
     for (let j = 0; j < qs.length; j++) {  
      qs[j].open = false;
     }
     setQuestions(qs);
  }

  function handleExpand(i){
    let qs = [...questions]; 
    for (let j = 0; j < qs.length; j++) {
      if(i ===j ){
        qs[i].open = true;
 
      } else{
        qs[j].open = false;
       }
    }
     setQuestions(qs);
  }

  function questionsUI(){
    return  questions.map((ques, i)=> (
      <Draggable key={i} draggableId={i + 'id'} index={i}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <div>
          <div style={{marginBottom: "15px"}}>
            <div style={{width:'100%', marginBottom: '-7px' }}>
              <DragIndicatorIcon style={{transform: "rotate(-90deg)", color:'#DAE0E2'}} fontSize="small"/>
            </div>
          
            <Accordion onChange={()=>{handleExpand(i)}} expanded={questions[i].open}>
              <AccordionSummary            
                aria-controls="panel1a-content"
                id="panel1a-header"
                elevation={1} style={{width:'100%'}}
              >
                { !questions[i].open ? (
              <div style={{display: 'flex',flexDirection:'column', alignItems:'flex-start', marginLeft: '3px', paddingTop: '15px', paddingBottom: '15px'}}>
                {/* <TextField id="standard-basic" label=" " value="Question" InputProps={{ disableUnderline: true }} />  */}
                
                <Typography variant="subtitle1" style={{marginLeft: '0px'}}>{i+1}.  {ques.questionText}</Typography>


                {ques.questionImage !==""?(
                  <div>
                    <img src={ques.questionImage} width="400px" height="auto" /><br></br><br></br>
                  </div>
                ): "" }
                
                {ques.options.map((op, j)=>(
                 
                 <div key={j}>
                   <div style={{display: 'flex'}}>
                    <FormControlLabel disabled control={<Radio style={{marginRight: '3px', }} />} label={
                        <Typography style={{color: '#555555'}}>
                          {ques.options[j].optionText}
                        </Typography>
                      } />
                   </div>


                 </div>
                ))}  
              </div>            
              ): ""}   
              </AccordionSummary>

              <AccordionDetails>
              <div style={{display: 'flex',flexDirection:'column', alignItems:'flex-start', marginLeft: '15px', marginTop:'-15px'}}>
                <div style={{display:'flex', width: '100%', justifyContent: 'space-between'}}>
                  <Typography style={{marginTop:'20px'}}>{i+1}.</Typography>
                  <TextField 
                        fullWidth={true} 
                        placeholder="Question Text" 
                        style={{marginBottom: '18px'}}  
                        rows={2}
                        rowsMax={20}
                        multiline={true}

                        value={ques.questionText}
                        variant="filled"
                      onChange={(e)=>{handleQuestionValue(e.target.value, i)}}
                  />

                </div>

                <div>

                </div>
                
                <div style={{width: '100%'}}>
                {ques.options.map((op, j)=>(
                 
                 <div key={j}>
                      <div  style={{display:'flex', flexDirection:'row', marginLeft:'-12.5px', justifyContent: 'space-between', paddingTop: '5px', paddingBottom: '5px'}}>

                          <Radio disabled /> 
                          <TextField 
                            fullWidth={true} 
                            placeholder="Option text" 
                            style={{marginTop: '5px'}} 
                            value={ques.options[j].optionText}
                            onChange={(e)=>{handleOptionValue(e.target.value, i, j)}}
                          />

                          {/* <IconButton aria-label="upload image" onClick={()=>{uploadImage(i, j)}}>
                            <CropOriginalIcon />
                          </IconButton> */}

                          <IconButton aria-label="delete" onClick={()=>{removeOption(i, j)}}>
                            <CloseIcon />
                          </IconButton>
                          </div>

                          <div>
                          {
                            checkImageHereOrNotForOption(op.optionImage) ? (
                            <div>
                              <div style={{width:'150px', display: 'flex', alignItems:'flex-start', paddingLeft:'20px'}}>
                                <img src={op.optionImage} width="90px" height="auto"/>
                                
                                <IconButton style={{marginLeft: '-15px', marginTop: '-15px',zIndex:999, backgroundColor: 'lightgrey', color:'grey'}}
                                            size="small"
                                            onClick={()=>{
                                              updateImageLink("", {question: i, option: j})
                                            }}
                                            >
                                  <CloseIcon />
                                </IconButton>
                              </div>
                              <br></br>
                              <br></br>  
                            </div>
                            ): ""
                          }
                          </div>
                 </div>
                ))}  
                </div>  
                
                
                {ques.options.length < 5 ? (
                  <div>
                  <FormControlLabel disabled control={<Radio />} label={
                    <Button size="small" onClick={()=>{addOption(i)}} style={{textTransform: 'none', marginLeft:"-5px"}}>
                      Add Option
                    </Button>
                  } /> 
                  </div>
                ): ""}

                <br></br>
                <br></br>

                <Typography variant="body2" style={{color: 'grey'}}>You can add maximum 5 options. If you want to add more then change in settings. Multiple choice single option is availible</Typography>
              </div>
              </AccordionDetails>

              <Divider />
              
              <AccordionActions>               
                    <IconButton aria-label="View" onClick={()=>{showAsQuestion(i)}}>
                      <VisibilityIcon />
                    </IconButton>

                    <IconButton aria-label="Copy" onClick={()=>{copyQuestion(i)}}>
                      <FilterNoneIcon />
                    </IconButton>
                    <Divider orientation="vertical" flexItem/>

                    <IconButton aria-label="delete" onClick={()=>{deleteQuestion(i)}}>
                      <DeleteOutlineIcon />
                    </IconButton>

                    <IconButton aria-label="Image">
                      <MoreVertIcon />
                    </IconButton>
              </AccordionActions>
            </Accordion>
          </div>
      </div>
                    </div>
                  )}
      </Draggable>
      
     )
    )
  }


  const handleClose1 = () => {
    setOpen1(false);
  };
  const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuDialogContent-root': {
      padding: theme.spacing(2),
    },
    '& .MuDialogActions-root': {
      padding: theme.spacing(1),
    },
  }));
  
  const BootstrapDialogTitle = (props) => {
    const { children, onClose, ...other } = props;
  
    return (
      <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
        {children}
        {onClose ? (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        ) : null}
      </DialogTitle>
    );
  };
  
  BootstrapDialogTitle.propTypes = {
    children: PropTypes.node,
    onClose: PropTypes.func.isRequired,
  };
  


  if(loading){
    return(

     <BootstrapDialog
     onClose={handleClose1}
     aria-labelledby="customized-dialog-title"
     open={open1}
    
   >

     <DialogContent 
      style={{backgroundColor: "trasparency"}}          
dividers>
     <Typography gutterBottom >
     
<div style={{alignItems: "center",display: "flex"}}>
<div><CircularProgress /></div>
<div style={{marginLeft:10}}> Loading... </div>
</div>

 
     </Typography>


     </DialogContent>

   </BootstrapDialog>
     
    )
  }else{

    return (
      <>
                      <ToastContainer/>

       <div style={{marginTop:'15px', marginBottom: '7px', paddingBottom:"30px"}}>
           
           {formDescription !== '' && formTitle !== '' &&(
            <Grid
            container
            direction="column"
            justify="center"
            alignItems="center"
            >
              
             <Grid item xs={12} sm={5} style={{width: '100%'}}>
                  <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                  >
                  <Grid style={{borderTop: '10px solid teal', borderRadius: 10}}

                  >
                      <div>
                          <div>
                            <Paper elevation={2} style={{width:'100%'}}>
                              <div style={{display: 'flex',flexDirection:'column', alignItems:'flex-start', marginLeft: '15px', paddingTop: '20px', paddingBottom: '20px'}}>
                                <Typography variant="h4" style={{fontFamily:'sans-serif Roboto', marginBottom:"15px"}}>
                                  {formTitle}
                                </Typography>
                                <Typography variant="subtitle1">
                                    {formDescription}
                                </Typography>
                              </div>
                            </Paper>
                          </div> 
                      </div>       
                  </Grid>  
                 </motion.div>
                  <Grid style={{paddingTop: '10px'}}>
                    <motion.div
                    variants={submitBtns}
                    >
                    <ImageUplaodModel handleImagePopOpen={openUploadImagePop} handleImagePopClose={()=>{setOpenUploadImagePop(false)}} updateImageLink={updateImageLink} contextData={imageContextData}/>

                    <DragDropContext onDragEnd={onDragEnd}>
                      <Droppable droppableId="droppable">
                        {(provided, snapshot) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            {questionsUI()}

                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                    <div>                       
                        <Button
                          variant="contained"
                          
                          onClick={addMoreQuestionField}
                          endIcon={<AddCircleIcon />}
                          style={{margin: '5px'}}
                        >Add Question </Button>

                        <Button
                          variant="contained"
                          color="primary"
                          onClick={addData}
                          style={{margin: '5px'}}
                          endIcon={<PublishIcon />}
                        >Submit </Button>
                      </div>
                    </motion.div>
                  </Grid>        
              </Grid>           
           </Grid>
           )}
           
       </div>
       </>
  );
  }

 
}
export default QuestionsTab
