"""
School Management API Router

Implements school and class management endpoints for the multi-tenant platform.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlmodel import Session, select
from typing import Optional, List
from datetime import datetime
import logging

from core.db import get_db_session
from core.school.models import (
    School, SchoolClass, SchoolCreate, SchoolUpdate, SchoolResponse,
    ClassCreate, ClassUpdate, ClassResponse, APISchoolResponse,
    SchoolsListResponse, APIClassResponse, ClassesListResponse,
    SchoolStatus, SchoolType
)
from core.auth.models import User, UserRole
from app.router.auth import get_current_user, get_current_tenant, require_permission

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/schools", tags=["School Management"])


@router.get("", response_model=SchoolsListResponse)
async def list_schools(
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db_session: Session = Depends(get_db_session),
    tenant_id: str = Depends(get_current_tenant)
):
    """Get list of schools for the current tenant."""
    try:
        # Build base query - no tenant_id filter since it's not in the existing schema
        statement = select(School)
        
        # Apply filters based on user role
        if current_user.role == UserRole.SCHOOL_ADMIN:
            # School admins can only see their own school
            statement = statement.where(School.principal_id == current_user.id)
        
        # Apply search filter
        if search:
            search_term = f"%{search}%"
            statement = statement.where(
                (School.name.ilike(search_term)) |
                (School.code.ilike(search_term))
            )
        
        # Get total count
        count_statement = statement
        total_schools = len(db_session.exec(count_statement).all())
        
        # Apply pagination
        offset = (page - 1) * limit
        statement = statement.offset(offset).limit(limit)
        
        schools = db_session.exec(statement).all()
        
        # Calculate pagination info
        total_pages = (total_schools + limit - 1) // limit
        has_next = page < total_pages
        has_prev = page > 1
        
        return SchoolsListResponse(
            status="success",
            data={
                "schools": [SchoolResponse.from_school(school) for school in schools],
                "pagination": {
                    "page": page,
                    "limit": limit,
                    "total": total_schools,
                    "pages": total_pages,
                    "has_next": has_next,
                    "has_prev": has_prev
                }
            }
        )
        
    except Exception as e:
        logger.error(f"List schools error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve schools"
        )


@router.post("", response_model=APISchoolResponse, status_code=status.HTTP_201_CREATED)
async def create_school(
    school_data: SchoolCreate,
    current_user: User = Depends(require_permission("schools:write")),
    db_session: Session = Depends(get_db_session),
    tenant_id: str = Depends(get_current_tenant)
):
    """Create a new school in the current tenant."""
    try:
        # Check if school code already exists
        existing_school = db_session.exec(
            select(School).where(School.code == school_data.code)
        ).first()
        
        if existing_school:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="School with this code already exists"
            )
        
        # Find principal if email provided
        principal_id = None
        if school_data.principal_email:
            principal = db_session.exec(
                select(User).where(
                    User.email == school_data.principal_email,
                    User.role == UserRole.SCHOOL_ADMIN
                )
            ).first()
            
            if not principal:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Principal not found or not a school admin"
                )
            principal_id = principal.id
        
        # Create school
        school = School(
            name=school_data.name,
            code=school_data.code,
            school_type=school_data.school_type,
            address=school_data.address,
            phone=school_data.phone,
            email=school_data.email,
            status=school_data.status,
            principal_id=principal_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db_session.add(school)
        db_session.commit()
        db_session.refresh(school)
        
        return APISchoolResponse(
            status="success",
            data=SchoolResponse.from_school(school)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create school error: {e}")
        db_session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create school"
        )


@router.get("/{school_id}", response_model=APISchoolResponse)
async def get_school(
    school_id: str,
    current_user: User = Depends(get_current_user),
    db_session: Session = Depends(get_db_session),
    tenant_id: str = Depends(get_current_tenant)
):
    """Get a specific school by ID."""
    try:
        school = db_session.exec(
            select(School).where(School.id == school_id)
        ).first()
        
        if not school:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="School not found"
            )
        
        # Check permissions
        if (current_user.role == UserRole.SCHOOL_ADMIN and 
            school.principal_id != current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        return APISchoolResponse(
            status="success",
            data=SchoolResponse.from_school(school)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get school error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve school"
        )


@router.put("/{school_id}", response_model=APISchoolResponse)
async def update_school(
    school_id: str,
    school_data: SchoolUpdate,
    current_user: User = Depends(require_permission("schools:write")),
    db_session: Session = Depends(get_db_session),
    tenant_id: str = Depends(get_current_tenant)
):
    """Update a school's information."""
    try:
        school = db_session.exec(
            select(School).where(School.id == school_id)
        ).first()
        
        if not school:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="School not found"
            )
        
        # Check permissions
        if (current_user.role == UserRole.SCHOOL_ADMIN and 
            school.principal_id != current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Update fields
        update_data = school_data.dict(exclude_unset=True)
        
        # Handle principal email update
        if "principal_email" in update_data:
            principal_email = update_data.pop("principal_email")
            if principal_email:
                principal = db_session.exec(
                    select(User).where(
                        User.email == principal_email,
                        User.role == UserRole.SCHOOL_ADMIN
                    )
                ).first()
                
                if not principal:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Principal not found or not a school admin"
                    )
                update_data["principal_id"] = principal.id
            else:
                update_data["principal_id"] = None
        
        # Apply updates
        for field, value in update_data.items():
            setattr(school, field, value)
        
        school.updated_at = datetime.utcnow()
        
        db_session.commit()
        db_session.refresh(school)
        
        return APISchoolResponse(
            status="success",
            data=SchoolResponse.from_school(school)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update school error: {e}")
        db_session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update school"
        )


@router.delete("/{school_id}")
async def delete_school(
    school_id: str,
    current_user: User = Depends(require_permission("schools:delete")),
    db_session: Session = Depends(get_db_session),
    tenant_id: str = Depends(get_current_tenant)
):
    """Delete a school (soft delete by setting status to inactive)."""
    try:
        school = db_session.exec(
            select(School).where(School.id == school_id)
        ).first()
        
        if not school:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="School not found"
            )
        
        # Soft delete by setting status to inactive
        school.status = SchoolStatus.INACTIVE
        school.updated_at = datetime.utcnow()
        
        db_session.commit()
        
        return {"status": "success", "message": "School deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete school error: {e}")
        db_session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete school"
        )


# Class Management Endpoints
@router.get("/{school_id}/classes", response_model=ClassesListResponse)
async def list_school_classes(
    school_id: str,
    page: int = 1,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db_session: Session = Depends(get_db_session),
    tenant_id: str = Depends(get_current_tenant)
):
    """Get list of classes for a specific school."""
    try:
        # Verify school exists and user has access
        school = db_session.exec(
            select(School).where(School.id == school_id)
        ).first()
        
        if not school:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="School not found"
            )
        
        # Check permissions
        if (current_user.role == UserRole.SCHOOL_ADMIN and 
            school.principal_id != current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Get classes
        statement = select(SchoolClass).where(SchoolClass.school_id == school_id)
        
        # Get total count
        total_classes = len(db_session.exec(statement).all())
        
        # Apply pagination
        offset = (page - 1) * limit
        statement = statement.offset(offset).limit(limit)
        
        classes = db_session.exec(statement).all()
        
        # Calculate pagination info
        total_pages = (total_classes + limit - 1) // limit
        has_next = page < total_pages
        has_prev = page > 1
        
        return ClassesListResponse(
            status="success",
            data={
                "classes": [ClassResponse.from_class(cls) for cls in classes],
                "pagination": {
                    "page": page,
                    "limit": limit,
                    "total": total_classes,
                    "pages": total_pages,
                    "has_next": has_next,
                    "has_prev": has_prev
                }
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"List classes error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve classes"
        )


@router.post("/{school_id}/classes", response_model=APIClassResponse, status_code=status.HTTP_201_CREATED)
async def create_class(
    school_id: str,
    class_data: ClassCreate,
    current_user: User = Depends(require_permission("classes:write")),
    db_session: Session = Depends(get_db_session),
    tenant_id: str = Depends(get_current_tenant)
):
    """Create a new class in a school."""
    try:
        # Verify school exists
        school = db_session.exec(
            select(School).where(School.id == school_id)
        ).first()
        
        if not school:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="School not found"
            )
        
        # Find teacher if email provided
        teacher_id = None
        if class_data.teacher_email:
            teacher = db_session.exec(
                select(User).where(
                    User.email == class_data.teacher_email,
                    User.role == UserRole.TEACHER
                )
            ).first()
            
            if not teacher:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Teacher not found or not a teacher role"
                )
            teacher_id = teacher.id
        
        # Create class
        school_class = SchoolClass(
            name=class_data.name,
            academic_session=class_data.academic_session,
            capacity=class_data.capacity,
            school_id=school_id,
            teacher_id=teacher_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db_session.add(school_class)
        db_session.commit()
        db_session.refresh(school_class)
        
        return APIClassResponse(
            status="success",
            data=ClassResponse.from_class(school_class)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create class error: {e}")
        db_session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create class"
        )